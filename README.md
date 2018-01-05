# family-tree

The "family-tree" web page allows user to create, manage, upload and download family trees in JSON, SVG or PNG formats.

## Description

The web page has 3 components:
 
 * `navigation bar` on the top with menus
 * `tree bar`, a smaller bar with the name of the family tree currently loaded. The name changes its color to notify state of the current tree: green if it has original configuration, red if it has been modified
 * `viewport` which renders the current family tree

A family tree consists of a data collection describing **relatives** (rendered as nodes of the graph) 
and their **relationships** (rendered as links between nodes). 
The user can also group one or more relatives and add comments.

The `Tudors.json` is an example of family tree which can be uploaded and rendered by the "family-tree" web page.

### Relatives

It is quite easy to create a relative. If you right-clicks in every point of the viewport, a context menu with several items will display. 
You have to choose `Create relative...` item and a popup will be shown. 
This window allows you to edit details of the relative and you can submit changes by clicking over the `Save` button.
Finally the new relative-node will be rendered in the viewport at the same position you right-clicked.

You can change details of a relative by right-clicking over it and selecting `Edit...` menu item. The popup that is displayed allows you to edit details 
and submit changes by clicking over the `Save` button as well as for the creation just described before.

You can drag and drop one or more selected relatives.

### Relationships between relatives

There are two kind of relationships and they are rendered as links:
 
 * relationships between partners: it is a relative-relative link
 * relationships between a couple and sons/daughters: it is a relationship-relative link

#### Relationships between partners

They can be created in two ways:

 * by choosing `Link to partner` item of relative's context menu which is enabled only if two nodes are selected
 * by dragging and dropping the new link once it anchors to the partners. Each relative-node has two rhomboid ports, one on the left and the other on the right. These are the anchoring points for relationship-links.


#### Relationships between a couple and sons/daughters

The relationships between a couple and sons/daughters are represented as links anchored to a partner-relationship link and a relative-node.
The creation of this type of relationship starts by clicking over circular port displayed in the middle of partner-relationship link.
Then user has to drag and drop the end of link when it anchors to relative-node which will be new son or daughter. That's it!


### Grouping relatives

Sometimes, it can be usefull to group relatives for some reasons. This web page allows you to do it! 
A grouping element consists of tree objects:

 * a fixed bordered rectangle which contains grouped relative-nodes
 * a text area with a description of the group
 * a segment linking the previous two objects 
 
Only text area can be dragged and dropped. If user moves one or more relatives of a group, the bordered rectangle will be updated to keep on containing them.
Once user right-clicks over a selected relative-node, it can add it to (or remove it from) a new group or an existing one by choosing the related item of context menu.

### Shortcuts

The following list reports all available shortcuts:

 * `Ctrl + Z`: undo last action
 * `Ctrl + Y`: redo last action
 * `Ctrl + A`: select all items of loaded tree
 * `Ctrl + click`: add item to selection (or remove it from selection if already selected)
 * `Del`: delete selected items
 * `S`: pan and zoom view to center selected items
 * `E`: pan and zoom view to center the tree
 

## Future works

 * Find relatives and groups by typing text in a special searching field
 * Enable the attachment of image to relative
 * Enable features for touch devices
