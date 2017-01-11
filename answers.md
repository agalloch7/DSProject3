# Answers for Questions

### Q3a
**Question:** Name the HTML element (type and class) that represents the interactive area.

-
<br>type: rect
<br>class: background

### Q3b
**Question:** Name the HTML element (type and class) that is used for representing the brushed selection.

-
<br>type: rect
<br>class: extent

### Q3c
**Question:** What do the other DOM elements of brush represent? 

-
<br>A svg group (class: resize w) is added to the left of the brushed selection and another (class: resize e) is added to the right. By default these both contain invisible rectangles extendign from to top to the bottom of the brush. These represent the handles which are used to adjust the size of the selection. They provide an element to attach css styles to drive the change of cursor when hovering over the edges of the selection. They can be customized to display visual handles. 
