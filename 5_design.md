# Answers for Questions

### Q5a
**Question:** Choose __one__ comparison scenario and create at least three alternative designs that would allow this comparison.

-
**Answer:**

- **"design_a":** When dragging the handles on the "Comparison Range" from the left to select a time range, the "Distribution of Priorities" graph divides into upper and lower portions for the "Selection" and "Comparison" ranges respectively.
- An Age Distribution for the comparison range is displayed on the right.

- **"design_b":** When selecting a "Comparison Range" the extent of the selection is displayed on the main graph with two dotted lines.
- The bars of the "Distribution of Priorities" chart divide in two, with "selection" values displayed on the left and "comparison" ones on the right.
- "Age Distributions" for the ranges are positioned back-to-back.

- **"design_c":** When clicking and draging on the "Comparison Range" the brush is displayed in bright pink and the extent of the selection is displayed in pink with low opacity on the main chart. This to make the "selection" and "comparison" ranges easy to compare.
- In the "Distribution of Priorities" graph the bars of the "comparison" range overlay those of the "selection" range. They have bright pink borders and are filled with white at a very low opacity. This to make it easy to interpret both the "selection" and "comparison" graphs simultaneously regardless of the color of the underlying bar. (Even pink) 
- A bright pink path on the "Age Distribution" graph overlays the "selection" area to display the distribution of the "comparison" range.
- Blue horizontal lines on all three graphs represent averages. These need to update as the distortion and selection are changed. Dashed, pink horizontal lines represent the average of the "comparison" range on the "Age" and "Priority Distribution" graphs. Average values are displayed to the right of all the average lines. (Not implemented)
- Coloring all "comparison" elements bright pink makes then stand out and creates a meaningful link between them.
 
### Q5b
**Question:** Implement one design in your visualization for **PrioVis** and explain why you have chosen this design.

-
**Answer:**

- "design_a" effectively compares the shapes of the priority distributions, however it is not easy to see how an individual priority differs from the "selection" graph to the "comparison" one with any precision.
- By stacking them next to one another, "design_b" more effectively compares "selection" and "comparison" values for individual priorities but it is not easy to read the graph as a whole. It is very busy and difficult to visually separate the two categories.
- By overlaying the comparison bars, "design_c" provides a cleaner solution which is easier to interpret. The comparison bars are all one, bright color and are filled with a very low opacity. This makes it easier to visually separate the "comparison" graph from the "selection" one with the viewer able to switch their focus between the two. At the same time the difference between "comparison" and "selection" values is clear.
- When the "comparison" value is greater that the "selection", the gap is white. When vica versa the gap is the original, bright color of the "selection" graph. (Compared to the more insipid color caused by overlay of the "comparison" values.) This has the effect of easily reading which bars are "greater" or "less than" when comparing ranges.
- In addition, by overlaying the "comparison" path over the "selection" area on the "Age Distribution" graph, the viewer can compare the two with more accuracy than the other designs.

### Q5c
**Question:** As a very minimal case study submit a screenshot of an interesting pattern which you have found with your method and briefly describe the pattern.

-
**Answer:**

- In my screenshot I compared the first six months of 2013 with the last. 
- The age profile of voters differs between the two periods with a spike in younger voters during the second half of the year.
- The average age for the last six months is four years less than the first.
- On September 16, there must have been a specific event that garnered votes from three specific ages.
- The small gaps between the "comparison" and "selection" bars on the "Distribution of Priorities" shows that the number of votes cast is very similar.
- What I found interesting is that, despite the change in the age profiles, the distribution of priorities remained very consistent over time.

