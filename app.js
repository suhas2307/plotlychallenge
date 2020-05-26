// Function for the initial plot
function init() {
    // Read samples.json
    d3.json("samples.json").then((data) => {
        // Assign the data to the global variable
        jsonData = data;

        // Get the individuals from the JSON file
        var optionValues = data.names;

        // Append option tag for each individual
        var options = selObj.selectAll("option")
            .data(optionValues) // Array of individual IDs
            .enter() // Used when the joined array is longer than the selection
            .append("option")
            .attr('value', (v => v))
            .text((t => t));

        // Another way to add options to the select tag using for loop
        // d3.json("samples.json").then((data) => {
        //     var names = data.names;

        //     names.forEach(val=>{
        //         var option = selObj.append('option');
        //         option.attr('value',val).text(val);
        //     });
        // });

        // Get data for initial plot using the first person in the array. personData will be an array containing 2 Objects (metadata - index 0 and samples index 1)
        var personData = getPersonData(data.names[0], data);

        // Plot the bar chart
        plotBar(personData[1], false);

        // Plot bubble chart
        plotBubble(personData[1]);

        // Display demographic information
        displayMetadata(personData[0]);
    });
};

// Function ot handle the change in drop down selection
function optionChanged(val) {
    // personData will be an array containing 2 Objects (metadata - index 0 and samples index 1) for the ID selected in the dropdown
    var personData = getPersonData(val, jsonData);

    // Plot the bar chart
    plotBar(personData[1], true);

    // Plot bubble chart
    plotBubble(personData[1]);

    // Display demographic information
    displayMetadata(personData[0]);
};

// Function to retrieve metadata and samples for the person selected in the dropdown
function getPersonData(personID, data) {
    var metadata = data.metadata.find(item => item.id == personID);
    var sample = data.samples.find(item => item.id === personID);

    return [metadata, sample];
};

// Function to get the data required to plot the bar chart
function getBarPlotData(sample) {
    var otuIds = sample.otu_ids;
    var otuLabels = sample.otu_labels;
    var sampleVals = sample.sample_values;

    // Build array for sorting based on sample_values
    var sampleArray = sampleVals.map((val, index) => [val, otuIds[index], otuLabels[index]]);

    // Sort array in descending order
    sampleArray.sort((a, b) => b[0] - a[0]);

    return sampleArray.slice(0, 10);
}

// Function to plot the bar chart
function plotBar(personData, restyle_req) {
    // Retrieve data for Bar Plot. plotData will contain the top 10 OTUs required for plotting
    var plotData = getBarPlotData(personData);

    // Reverse the array to prevent Plotly defaults
    var reversedPlotData = plotData.reverse();

    var x = reversedPlotData.map(item => item[0]);
    var y = reversedPlotData.map(item => `OTU ${item[1]}`);
    var text = reversedPlotData.map(item => item[2]);

    // Check if it is the initial plot or plot on change in drop down value
    if (!restyle_req) {
        var trace = {
            x: x,
            y: y,
            text: text,
            type: 'bar',
            orientation: 'h'
        };

        var data = [trace];
        var layout = {
            title: "OTU vs Sample Values",
            xaxis: { title: 'Values' },
            yaxis: { title: 'OTU' }
        };

        Plotly.newPlot('bar', data, layout);
    }
    else {
        var update = {
            x: [x],
            y: [y],
            text: [text]
        };

        Plotly.restyle('bar', update);
    };

};

// Function to Plot Bubble Chart
function plotBubble(personData) {
    var x = personData.otu_ids;
    var y = personData.sample_values;
    var size = personData.sample_values;
    var colors = personData.otu_ids;
    var text = personData.otu_labels;

    var trace1 = {
        x: x,
        y: y,
        mode: 'markers',
        marker: {
            color: colors,
            size: size
        },
        text: text
    };

    var data = [trace1];
    var layout = {
        title: "OTU vs Sample Values Bubble Chart",
        xaxis: { title: "OTU ID" },
        yaxis: { title: "Sample Value" }
    };

    Plotly.newPlot('bubble', data, layout);
};

function displayMetadata(metadata) {
    // Clear previous text before appending
    metadataDivTag.text('');

    Object.entries(metadata).forEach(([key, value]) => {
        metadataDivTag.append("p").text(`${key}: ${value}`)
    });
};

// Main execution
// Global variable to hold the JSON data
var jsonData = {};

// Select the dropdown object
var selObj = d3.select('#selDataset');

// Select the metadata div tag
var metadataDivTag = d3.select('#sample-metadata');

// Initial Plot
init();
