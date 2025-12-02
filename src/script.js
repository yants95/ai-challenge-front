let uploadedFile = null;

const fileLabel = document.getElementById('file-label');
const analyzeButton = document.getElementById('analyze-button');
const analyzeButtonText = document.getElementById('button-text');
const resultsContainer = document.getElementById('results-section');
const errorContainer = document.getElementById('error-container');

const showError = (message = null) => {
  errorContainer.innerHTML = '';

  if (!message) return;

  errorContainer.innerHTML = `
    <div class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-3">
      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path>
      </svg>
      <span class="font-medium">${message}</span>
      <button onclick="showError()" class="ml-auto text-red-500 hover:text-red-700">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  `;
};

const showInitialResultsMessage = () => {
  resultsContainer.innerHTML = `
    <div class="mt-10 p-6 text-center bg-gray-100 rounded-xl border border-dashed border-gray-300 text-gray-600">
      <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
      </svg>
      <p>Awaiting contract file upload to begin analysis.</p>
    </div>
  `;
};

const renderAnalysisResults = (data) => {
  if (!data) {
    showInitialResultsMessage();
    return;
  }

  let risksHTML = data.risks
    .map(risk => `
      <div class="flex flex-col bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 border-red-500">
        <p class="text-sm font-semibold text-gray-600 mb-2">${risk.risk}</p>
        <div class="p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
          <p class="font-medium text-gray-700">${risk.explanation}</p>
        </div>
      </div>
    `)
    .join('');

  resultsContainer.innerHTML = `
    <div class="mt-8">
      <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Analysis Results</h2>
      <div class="space-y-6">${risksHTML}</div>
      <br>
      <h4>Recommendations</h4>
      <p class="font-small text-gray-700">${data.revision}</p>
    </div>
  `;
};

const setAnalyzeButtonState = (isLoading, fileAttached) => {
  const enabled = fileAttached && !isLoading;

  analyzeButton.disabled = !enabled;

  analyzeButton.className = `
    w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm 
    transition duration-300 ease-in-out transform hover:scale-105
    ${enabled
      ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
  `;

  analyzeButtonText.innerHTML = isLoading
    ? '<div class="spinner mr-2"></div> Analyzing...'
    : '2. Trigger Analysis';
};

const onFileSelect = (event) => {
  const file = event.target.files[0];

  uploadedFile = null;
  showError();
  renderAnalysisResults(null);

  if (!file) {
    fileLabel.innerHTML = defaultFileLabel();
    setAnalyzeButtonState(false, false);
    return;
  }

  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    showError('Please upload a PDF file.');
    fileLabel.innerHTML = defaultFileLabel();
    setAnalyzeButtonState(false, false);
    return;
  }

  uploadedFile = file;
  fileLabel.innerHTML = fileLabelWithName(file.name);
  setAnalyzeButtonState(false, true);
};

const defaultFileLabel = () => `
  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
  </svg>
  Choose File...
`;

const fileLabelWithName = (name) => `
  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
  </svg>
  ${name}
`;

function handleFileChange(event) {
  onFileSelect(event);
}

function handleAnalyze() {
  onAnalyzeClick();
}

const onAnalyzeClick = async () => {
  if (!uploadedFile) {
    showError('Please select a file first.');
    return;
  }

  setAnalyzeButtonState(true, true);
  showError();
  renderAnalysisResults(null);

  const formData = new FormData();
  formData.append('files', uploadedFile);

  try {
    const response = await fetch('http://localhost:3000/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Request failed with ${response.status}`);
    }

    const result = await response.json();

    renderAnalysisResults({
      risks: result[0].risks,
      revision: result[0].revision
    });

  } catch (err) {
    showError(err.message || 'Unexpected error during analysis.');
  } finally {
    setAnalyzeButtonState(false, true);
  }
};
