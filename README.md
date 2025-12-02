For this test I opted for developing the simplest solution ever, so none of frameworks to avoid overkill and focused on goal: analyze docs and return a clear feedback to user.

So I create a simple api with a minimum organization with chain of responsibilities and the client followed the same idea.

I also opted for not adding any layer of validation, any use of databases, only the nodejs and a few libs as well pure html, css and javascript for frontend.

With more time, having more well-defined requirements I'd do a more robust architecture and other things that are important to reduce latency, cost of 3rd http calls to analyze docs, etc.
