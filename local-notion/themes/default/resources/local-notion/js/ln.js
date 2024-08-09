$(document).ready(function() {

    // remove empty block children
    $(".ln-block-children:not(:has(*))").remove();
    $(".ln-callout-children:not(:has(*))").remove();



    // Initialize the datatables (after lazy loaded datatables script loads)
    var maxRetries = 50; // Maximum number of polling attempts
    var interval = 100; // Polling interval in milliseconds

    function SetDataTables(retries) {
        if (typeof $.fn.DataTable !== 'undefined') {
            // DataTables is loaded, initialize it
            $('.ln-database').DataTable();
        } else if (retries > 0) {
            // DataTables is not loaded, check again after a delay
            setTimeout(function () {
                SetDataTables(retries - 1);
            }, interval);
        } else {
            // Max retries reached, log an error or handle as needed
            console.error('DataTables script did not load in time.');
        }
    }
    // Start polling with the maximum number of retries
    SetDataTables(maxRetries);

});