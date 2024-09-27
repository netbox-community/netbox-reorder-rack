// Variable to track whether changes have been made
import { GridStack } from 'gridstack';
import { Toast } from 'bootstrap';

var changesMade = false;
var gridItemsMap = [];
var grids = [];

function createToast(level, title, message, extra) {
  // Set the icon based on the toast level
  let iconName = 'mdi-alert';  // default icon
  switch (level) {
    case 'warning':
      iconName = 'mdi-alert';
      break;
    case 'success':
      iconName = 'mdi-check-circle';
      break;
    case 'info':
      iconName = 'mdi-information';
      break;
    case 'danger':
      iconName = 'mdi-alert';
      break;
  }

  // Create the container for the toast
  const container = document.createElement('div');
  container.setAttribute('class', 'toast-container position-fixed bottom-0 end-0 m-3');

  // Create the main toast element
  const main = document.createElement('div');
  main.setAttribute('class', `toast`);
  main.setAttribute('role', 'alert');
  main.setAttribute('aria-live', 'assertive');
  main.setAttribute('aria-atomic', 'true');

  // Create the toast header
  const header = document.createElement('div');
  header.setAttribute('class', `toast-header bg-${level} text-dark`);

  // Add the icon to the header
  const icon = document.createElement('i');
  icon.setAttribute('class', `mdi ${iconName}`);

  // Add the title to the header
  const titleElement = document.createElement('strong');
  titleElement.setAttribute('class', 'me-auto ms-1');
  titleElement.innerText = title;

  // Add the close button to the header
  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.setAttribute('class', 'btn-close');
  button.setAttribute('data-bs-dismiss', 'toast');
  button.setAttribute('aria-label', 'Close');

  // Create the toast body
  const body = document.createElement('div');
  body.setAttribute('class', 'toast-body text-dark');
  body.innerText = message.trim();

  // Assemble the header
  header.appendChild(icon);
  header.appendChild(titleElement);

  // If extra info is provided, add it to the header
  if (typeof extra !== 'undefined') {
    const extraElement = document.createElement('small');
    extraElement.setAttribute('class', 'text-dark');
    extraElement.innerText = extra;
    header.appendChild(extraElement);
  }

  // Add the close button to the header
  header.appendChild(button);

  // Assemble the main toast
  main.appendChild(header);
  main.appendChild(body);
  container.appendChild(main);

  // Add the toast container to the body
  document.body.appendChild(container);

  // Initialize the Bootstrap toast
  const toast = new Toast(main);
  return toast;
}

// Function to get the items from the grids
function getItems(grids) {
  // Initialize the gridItemsMap
  grids.forEach(function (grid, gridIndex) {
    // Get the grid items
    var gridItems = grid.getGridItems();
    gridItemsMap[gridIndex] = {};
    // Iterate over the grid items and add them to the gridItemsMap
    gridItems.forEach(function (item) {
      gridItemsMap[gridIndex][item.gridstackNode.id] = item;
    });
  });
}

function acceptWidgets(el) {
  // Get the grid ID
  var gridId = el.gridstackNode.grid.el.getAttribute('data-grid-id');

  // If the grid ID is 2 or the item is not full depth, return true
  if (gridId === "2") {
    return true;
  } else if (el.getAttribute('data-full-depth') === "False") {
    return true;
  }
  return false;
}

function acceptOtherWidgets(e) {
  return true;
}

function initializeGrid(element, acceptWidgets) {
  return GridStack.init(options = {
    cellHeight: 11,
    margin: 0,
    marginBottom: 1,
    float: true,
    disableOneColumnMode: true,
    animate: true,
    removeTimeout: 100,
    disableResize: true,
    acceptWidgets: acceptWidgets,
  }, element);
}

function saveRack(rack_id, desc_units) {
  getItems(grids);
  var data = {};

  // Get the items from the grids
  gridItemsMap.forEach((grid, gridIndex) => {
    // Initialize an array to store the data for each grid
    let gridData = [];

    // Iterate over the keys in the grid object
    for (let key in grid) {
      // Get the item associated with the current key
      let item = grid[key];

      // If the face is not "back", process the item
      if (item.getAttribute('data-item-face') !== "back") {
        // Get the 'y' attribute of the item and divide by 2
        let y = parseInt(item.getAttribute('gs-y')) / 2;

        // Get the 'height' attribute of the item and divide by 2
        let u_height = parseInt(item.getAttribute('gs-h')) / 2;

        // Get the 'max-row' attribute of the grid and divide by 2
        let rack_height = item.gridstackNode.grid.el.getAttribute('gs-max-row') / 2;

        let u_position;
        // Calculate the 'u_position' based on the 'u_height' and 'y'
        if (desc_units) {
          u_position = y + 1;
        } else {
          u_position = u_height > 1 ? rack_height - y - u_height + 1 : rack_height - y;
        }

        // Push the item data to the 'gridData' array
        gridData.push({
          'id': parseInt(item.getAttribute('gs-id')),
          'x': parseInt(item.getAttribute('gs-x')),
          'y': u_position,
          'is_full_depth': item.getAttribute('data-full-depth'),
          'face': item.getAttribute('data-item-face'),
        });
      }
    }

    // Assign the 'gridData' array to the corresponding index in the 'data' array
    names = {
      0: 'front',
      1: 'rear',
      2: 'other'
    }
    data[names[gridIndex]] = gridData;
    data['rack_id'] = rack_id;
  });

  try {
    const res = fetch('/' + basePath + 'api/plugins/reorder/save/' + rack_id + '/', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': netbox_csrf_token,
      },
      body: JSON.stringify(data),
    });

    res.then(response => {
      if (response.ok) {
        // Reset changesMade flag and disable save button
        changesMade = false;
        var button = document.getElementById('saveButton');
        button.setAttribute('disabled', 'disabled');

        // Get JSON data from response
        response.json().then(jsonData => {
          console.log(jsonData);
        });

        // Redirect to the return URL after successful save
        window.location.href = returnUrl;

      } else if (response.status === 304) {
        // Handle the 304 Not Modified status
        console.warn('No changes detected.');
        const toast = createToast('warning', 'Info', 'No changes were detected.', 'The data has not been modified.');
        toast.show();

      } else {
        // Handle other errors
        response.json().then(errorData => {
          console.error('Error:', errorData);

          // Create and show an error toast notification
          const toast = createToast('danger', 'Error', errorData.error, errorData.message);
          toast.show();
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }

}

let frontGrid = initializeGrid("#grid-front", acceptWidgets);
let rearGrid = initializeGrid("#grid-rear", acceptWidgets);
let nonRackedGrid = initializeGrid("#grid-other", acceptOtherWidgets);

grids = [frontGrid, rearGrid, nonRackedGrid];
// Get the items from the grids
getItems(grids);

// Attach change event listener to each grid
grids.forEach(function (grid, gridIndex) {
  grid.on('change', function (event, items) {
    // Set changesMade to true when a change occurs
    changesMade = true;

    // Select the button element by its ID or any other selector
    var button = document.getElementById('saveButton');

    // Remove the disabled attribute
    button.removeAttribute('disabled');

    items.forEach(function (item) {
      // Find the other grid
      var otherGridIndex = (gridIndex === 0) ? 1 : 0;
      var otherGridItemsMap = gridItemsMap[otherGridIndex];

      // If the item is in the other grid, update the item in the other grid
      if (otherGridItemsMap && otherGridItemsMap[item.id]) {
        var otherItem = otherGridItemsMap[item.id];
        var otherGrid = grids[otherGridIndex];
        otherGrid.update(otherItem, {
          'x': item.x,
          'y': item.y
        });
      }
    });
  });
  grid.on('dropped', function (event, previousWidget, newWidget) {
    // Set changesMade to true when a change occurs
    changesMade = true;

    // Select the button element by its ID or any other selector
    var button = document.getElementById('saveButton');

    // Remove the disabled attribute
    button.removeAttribute('disabled');

    // Get the index of the grid where the widget was dropped
    var originGrid = grids.indexOf(previousWidget.grid);

    if (gridIndex === 0) {
      newWidget.el.setAttribute('data-item-face', 'front');
    } else if (gridIndex === 1) {
      newWidget.el.setAttribute('data-item-face', 'rear');
    }

    // If the widget was dropped in the non-racked grid
    if (originGrid === 2) {
      // Find the other grid
      var otherGridIndex = (gridIndex === 0) ? 1 : 0;

      // Get the other grid
      var otherGrid = grids[otherGridIndex];

      // If the widget is full depth, clone it and add it to the other grid
      if (otherGrid) {
        if (newWidget.el.getAttribute('data-full-depth') === "True") {
          // Clone the dropped widget
          var itemContent = newWidget.el.cloneNode(true); // Clone the dropped widget

          // Remove inline styles
          var subDiv = itemContent.querySelector('.grid-stack-item-content');
          subDiv.removeAttribute('style');
          // Apply CSS class
          subDiv.classList.add('device_rear');
          itemContent.setAttribute('data-item-face', 'back');

          // Add the cloned widget to the other grid
          otherGrid.addWidget(itemContent);
        }
      }

      // Get the items from the grids
      getItems(grids);

      // If the widget was dropped non-racked grid from the front or rear grid
    } else if ((originGrid === 0 || originGrid === 1) && gridIndex === 2) {
      // If the widget is full depth, remove the widget from the other grid
      if (newWidget.el.getAttribute('data-full-depth') === "True") {
        // Get the item content
        var itemContent = newWidget.el.querySelector('.grid-stack-item-content');

        // Remove the inline styles and apply the CSS class
        itemContent.removeAttribute('style');
        itemContent.classList.remove('device_rear');
        itemContent.setAttribute('data-item-face', 'front');

        // Get the background color and text color from the dropped widget
        var backgroundColor = newWidget.el.getAttribute('data-item-color');
        var textColor = newWidget.el.getAttribute('data-item-text-color');

        // Add style to the dropped widget
        itemContent.style = "background-color: #" + backgroundColor + "; color: #" + textColor + ";";

        // Find the other grid
        var otherGridIndex = (originGrid === 0) ? 1 : 0;
        var otherGrid = grids[otherGridIndex];

        // Get the widget from the other grid
        var widget = gridItemsMap[otherGridIndex][previousWidget.el.getAttribute('gs-id')];

        // Remove the widget from the other grid
        otherGrid.removeWidget(widget);
      }
      // Get the items from the grids
      getItems(grids);
    }
  });
});

// Get reference to the button
const saveButton = document.getElementById('saveButton');

// Attach click event listener to the button
saveButton.addEventListener('click', function (event) {
  // Call the saveRack function
  saveRack(rackId, descUnits);
});

// Attach event listener for beforeunload
window.addEventListener('beforeunload', function (event) {
  // Check if changes have been made
  if (changesMade) {
    // Display confirmation message
    event.returnValue = 'Are you sure you want to leave? Changes you made may not be saved.';
  }
});

document.getElementById('view-selector').addEventListener('change', function () {
  // Get the selected option value
  var selectedValue = this.value;

  // Construct the new URL with the selected option as a query parameter
  var currentUrl = window.location.href.split('?')[0];  // Get the base URL (without parameters)
  var newUrl = currentUrl + '?view=' + selectedValue;

  // Redirect to the new URL
  window.location.href = newUrl;
});
