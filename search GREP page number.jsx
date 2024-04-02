// Prompt the user for input
var userInput = prompt("Please enter a GREP:");

// Define the regular expression pattern to search for
var regexPattern = userInput;

app.findGrepPreferences = NothingEnum.NOTHING;
app.findChangeGrepOptions.includeMasterPages = false;
app.findGrepPreferences.findWhat = regexPattern;

// Create a new list to store search results
var searchResults = [];

var newArray = [];

//Create a new list to store all term occurences
var storedTerms = [];

// Get the active document
var doc = app.activeDocument;

// Check if a document is open
if (!doc) {
    alert("No document is open. Please open a document and run the script.");
} else {

        function searchThroughAllDocuments() {
            try {
                    
            // Search throughout the document
            for (i=0; i < app.documents.length; i++){
            var currentDocument = app.documents[i];
            var foundItems = currentDocument.findGrep();
                        
                for (var x = 0; x < foundItems.length; x++) {
                    var foundItem = foundItems[x];
            
                    // Ensure the found item is within a text frame and not on the pasteboard
                    if (foundItem.parentTextFrames.length > 0 && foundItem.parentTextFrames[0].parentPage !== null) {
                        var pageNumber = foundItem.parentTextFrames[0].parentPage.name;
                        var contents = foundItem.contents;
                        searchResults.push({ term: contents, page: pageNumber });
                    }
                
            }
        }
            
            } catch (error) {
                alert("An error occurred: " + error);
            }
        }
        
        function orderList(array) {
            array.sort(function (a, b) {
                // Extract numerical parts from term
                var termA = a.term.replace(/(\d+)\.(\d\d)/, '$1$2'); // Remove numbers at the end
                var termB = b.term.replace(/(\d+)\.(\d\d)/, '$1$2');
        
                // Compare terms without considering the number after the period
                var termComparison = termA.localeCompare(termB);
        
                if (termComparison === 0) {
                    // If terms are the same, sort by page
                    return a.page - b.page;
                } else {
                    // Otherwise, sort by the modified terms
                    return termComparison;
                }
            });
        
            return array;
        }

        function removeDuplicates(data) {
            storedTerms.push(data[0].term);
        
            for (var s = 1; s < data.length; s++) {
                var isDuplicate = false;
        
                for (var i = 0; i < storedTerms.length; i++) {
                    if (data[s].term === storedTerms[i]) {
                        isDuplicate = true;
                        break;
                    }
                }
        
                if (!isDuplicate) {
                    storedTerms.push(data[s].term);
                }
            }
        }

        // Function to remove duplicate pages for the same term
        function removeDuplicatePages(array) {
            var uniquePages = {}; // Object to store unique pages for each term
            var resultArray = [];

            // Iterate through the array
            for (var i = 0; i < array.length; i++) {
                var item = array[i];
                var term = item.term;
                var page = item.page;

                // Check if the page for the term is not already in the uniquePages object
                if (!uniquePages[term] || uniquePages[term] !== page) {
                    // Add the term and page to the result array
                    resultArray.push({ term: term, page: page });

                    // Update the uniquePages object with the current page for the term
                    uniquePages[term] = page;
                }
            }

            return resultArray;
        }

        // Function to save results to a text file
        function saveResultsToFile(results, filePath) {
            var file = new File(filePath);

            if (file.open("w")) {
                for (var k = 0; k < results.length; k++) {
                    var result = results[k];
                    file.write(result);
                }
                file.close();
                return true;
            } else {
                return false;
            }
        }

        //Check for the term through all opened files and save the terms and current page number
        searchThroughAllDocuments()

        // Create a new list 
        var orderedList = (orderList(searchResults))
        //var orderedList = ordenar(searchResults);
        
        // Remove duplicate pages for the same term
        removeDuplicates(orderedList)
        var cleanResults = removeDuplicatePages(searchResults);

        // Display the search results  
        var resultList = "";
        for (c = 0; c < storedTerms.length; c++) {
            var pages = "";
            for (b = 0; b < cleanResults.length; b++) {
                if (cleanResults[b].term == storedTerms[c]) {
                    pages += "p. " + cleanResults[b].page + ", ";
                }
            }
            resultList += storedTerms[c] + "\r" + pages.replace(/,\s*([^,]+)$/, function (match, group) {
                return "" + group;
            }) + "\r\r";
        }

        //    printTextOnStory(resultList);
        if (resultList) {
            var saveFile = File.saveDialog("Save results to text file");
            if (saveFile) {
                // Call the function to save results to the selected file
                if (saveResultsToFile(resultList, saveFile.fsName)) {
                    alert("Search complete. Results saved to: " + saveFile.fsName);
                } else {
                    alert("Error saving results to file.");
                }
            } else {
                alert("No file selected. Script terminated.");
            }
        }
    }

