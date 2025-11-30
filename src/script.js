let selectedFile = null;
const fileLabel = document.getElementById('file-label');
const analyzeButton = document.getElementById('analyze-button');
const buttonText = document.getElementById('button-text');
const resultsSection = document.getElementById('results-section');
const errorContainer = document.getElementById('error-container');

// --- MOCK DATA ---

/**
 * Generates mock analysis data based on the file name.
 * Includes necessary SVG icons for visual consistency with the React version.
 */
const mockAnalysis = (fileName) => ({
  contractTitle: fileName,
  risks: [
    {
      id: 1,
      type: "High Risk",
      icon: '<svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
      title: "Ambiguous Termination Clause",
      description: "Section 7.2 allows for unilateral termination with only 5 days' notice, which is below industry standard (30 days).",
      explanation: "The short notice period significantly increases counterparty risk and operational uncertainty. **Action:** Recommend amending to 30 days.",
    },
    {
      id: 2,
      type: "Medium Risk",
      icon: '<svg class="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
      title: "Undefined Indemnification Caps",
      description: "Indemnification caps are not explicitly defined, potentially exposing the client to unlimited liability in certain scenarios.",
      explanation: "Lack of a financial ceiling on obligations is a major negotiation point. **Action:** Propose a cap equal to the total contract value.",
    },
    {
      id: 3,
      type: "Low Risk",
      icon: '<svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
      title: "Jurisdiction & Governing Law",
      description: "Jurisdiction is set to 'Delaware', which may incur slightly higher litigation costs than the client's home state.",
      explanation: "While acceptable, this is a minor administrative/cost risk. **Action:** No immediate amendment required, but noted for template revision.",
    },
  ],
});

// --- UTILITY FUNCTIONS ---

/** Displays or clears an error message in the dedicated container. */
const displayError = (message = null) => {
  errorContainer.innerHTML = '';
  if (message) {
    errorContainer.innerHTML = `
            <div class="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-3">
                <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                <span class="font-medium">Error: ${message}</span>
                <button onclick="displayError()" class="ml-auto text-red-500 hover:text-red-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
        `;
  }
};

/** Renders the results of the analysis into the results container. */
const renderResults = (analysisResult) => {
  if (!analysisResult) {
    // Restore initial message if no results
    resultsSection.innerHTML = `
            <div id="initial-message" class="mt-10 p-6 text-center bg-gray-100 rounded-xl border border-dashed border-gray-300 text-gray-600">
                <svg class="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                <p>Awaiting contract file upload to begin analysis.</p>
            </div>
        `;
    return;
  }

  let resultsHTML = `
        <div class="mt-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                Analysis Results: ${analysisResult.contractTitle}
            </h2>
            <div class="space-y-6">
    `;

  analysisResult.risks.forEach(risk => {
    const borderColor = risk.type === 'High Risk' ? 'border-red-500' : risk.type === 'Medium Risk' ? 'border-yellow-500' : 'border-green-500';

    resultsHTML += `
            <div class="flex flex-col bg-white p-4 rounded-xl shadow-lg hover:shadow-xl transition duration-300 border-l-4 ${borderColor}">
                <div class="flex items-center space-x-3 mb-2">
                    ${risk.icon}
                    <h3 class="text-xl font-bold text-gray-800">${risk.title}</h3>
                </div>
                <p class="text-sm font-semibold text-gray-600 mb-2">${risk.description}</p>
                <div class="p-3 bg-gray-50 rounded-lg text-sm border border-gray-200">
                    <p class="font-medium text-gray-700">${risk.explanation}</p>
                </div>
            </div>
        `;
  });

  resultsHTML += `</div></div>`;
  resultsSection.innerHTML = resultsHTML;
};

/** Updates button state (loading/disabled/enabled). */
const updateButtonState = (loading, file) => {
  const hasFile = !!file;
  analyzeButton.disabled = loading || !hasFile;

  analyzeButton.className = `
        w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm 
        transition duration-300 ease-in-out transform hover:scale-105
        ${hasFile && !loading
      ? 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
    `;

  if (loading) {
    buttonText.innerHTML = '<div class="spinner mr-2"></div> Analyzing...';
  } else {
    buttonText.textContent = '2. Trigger Analysis';
  }
}


// --- EVENT HANDLERS ---

/** Handles file selection, updates UI, and clears previous results/errors. */
const handleFileChange = (event) => {
  const file = event.target.files[0];
  selectedFile = null;
  displayError();
  renderResults(null);

  if (file) {
    // Allow only PDF files
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      displayError('Please upload a PDF file.');
      fileLabel.innerHTML = 'Choose File...';
      updateButtonState(false, null);
      return;
    }

    selectedFile = file;
    fileLabel.innerHTML = `
            <!-- Upload Icon SVG -->
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            ${file.name}
        `;
    updateButtonState(false, file);
  } else {
    fileLabel.innerHTML = `
            <!-- Upload Icon SVG -->
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
            Choose File...
        `;
    updateButtonState(false, null);
  }
};

/** Triggers the analysis (simulated or real). */
const handleAnalyze = async () => {
  if (!selectedFile) {
    displayError('Please select a file first.');
    return;
  }

  updateButtonState(true, selectedFile);
  displayError();
  renderResults(null);

  // --- START: Mocked/Simulated Analysis (Functional for now) ---
  console.log(`Simulating analysis for: ${selectedFile.name}`);

  // Simulate network delay and processing time
  setTimeout(() => {
    try {
      // Mock a success scenario
      renderResults(mockAnalysis(selectedFile.name));

      // To simulate an error, uncomment the line below:
      // throw new Error("The analysis engine timed out while processing the document structure.");

    } catch (e) {
      displayError(e.message || 'An unknown error occurred during simulation.');
    } finally {
      updateButtonState(false, selectedFile);
    }
  }, 2500); // 2.5 seconds simulation time
  // --- END: Mocked/Simulated Analysis ---


  /*
  // --- START: Example of a real HTTP request using fetch (Commented out) ---
  
  // To switch to the real API call, uncomment this block and comment out the simulation block above.
  
  // const API_ENDPOINT = 'YOUR_ANALYSIS_API_URL_HERE';
  
  // // 1. Prepare data (often using FormData for file uploads)
  // const formData = new FormData();
  // formData.append('contract_file', selectedFile);
  
  // try {
  //     const response = await fetch(API_ENDPOINT, {
  //         method: 'POST',
  //         // Note: fetch will automatically set the 'Content-Type': 'multipart/form-data' 
  //         // when using a FormData object, so we omit the headers here.
  //         body: formData,
  //     });

  //     if (!response.ok) {
  //         // Handle server errors (e.g., 4xx or 5xx responses)
  //         const errorData = await response.json().catch(() => ({ message: "Unknown server error format." }));
  //         throw new Error(errorData.message || `API analysis failed with status: ${response.status}`);
  //     }

  //     const data = await response.json();

  //     // Assuming the API returns data structured like mockAnalysis:
  //     renderResults({
  //         contractTitle: selectedFile.name,
  //         risks: data.risks, // Use data returned from the API
  //     });
  //     
  // } catch (e) {
  //     console.error("Analysis API Call Error:", e);
  //     displayError(e.message || 'Failed to connect to the analysis service.');

  // } finally {
  //     updateButtonState(false, selectedFile);
  // }
  
  // --- END: Example of a real HTTP request ---
  */
};
