import React, { useRef, useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

// Define the props for the ScrollList component
interface ScrollListProps<T> {
  data: T[]; // The array of data items to display
  renderItem: (item: T, index: number) => React.ReactNode; // Function to render each item's content
  itemHeight?: number; // Optional: Fixed height for each item in pixels. Defaults to 155px.
}

const ScrollList = <T,>({
  data,
  renderItem,
  itemHeight = 155, // Default item height
}: ScrollListProps<T>) => {
  // useRef to get a reference to the scrollable div element
  const listRef = useRef<HTMLDivElement>(null);
  // useState to keep track of the index of the currently focused item
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  useEffect(() => {
    const updateFocusedItem = () => {
      if (!listRef.current) return;

      const container = listRef.current;
      // Get all direct children (the motion.div items)
      const children = Array.from(container.children) as HTMLDivElement[];
      const scrollTop = container.scrollTop; // Current vertical scroll position
      const containerCenter = container.clientHeight / 2; // Vertical center of the container

      let closestItemIndex = 0;
      let minDistanceToCenter = Infinity; // Initialize with a very large number

      // Iterate over each child item to find the one closest to the center
      children.forEach((child, index) => {
        const itemTop = child.offsetTop; // Top position of the item relative to its parent
        const actualItemHeight = child.offsetHeight; // Actual rendered height of the item
        const itemCenter = itemTop + actualItemHeight / 2; // Vertical center of the item

        // Calculate the distance from the item's center to the container's center, adjusted for scroll
        const distanceToCenter = Math.abs(
          itemCenter - scrollTop - containerCenter
        );

        // If this item is closer to the center than the previous closest
        if (distanceToCenter < minDistanceToCenter) {
          minDistanceToCenter = distanceToCenter;
          closestItemIndex = index;
        }
      });

      // Update the focused index state
      setFocusedIndex(closestItemIndex);
    };

    // Call immediately on mount to set initial focused item
    updateFocusedItem();

    // Add scroll event listener to update focused item on scroll
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener("scroll", updateFocusedItem);
    }

    // Cleanup function: remove the event listener when the component unmounts
    return () => {
      if (listElement) {
        listElement.removeEventListener("scroll", updateFocusedItem);
      }
    };
  }, [data, itemHeight]); // Dependencies: Re-run effect if data or itemHeight changes

  // Framer Motion Variants for defining animation states for each item
  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.7,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    focused: {
      opacity: 1,
      scale: 1,
      zIndex: 10,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    next: {
      opacity: 1,
      scale: 0.95,
      zIndex: 5,
      transition: { duration: 0.35, ease: "easeOut" },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  return (
    <div
      ref={listRef}
      className="h-full w-full overflow-y-auto scrollbar-hide"
      style={{
        scrollBehavior: "smooth",
      }}
    >
      {data.map((item, index) => {
        let variant = "hidden"; // Default variant

        // Determine the animation variant based on the item's position relative to the focused item
        if (index === focusedIndex) {
          variant = "focused"; // The currently focused item
        } else if (index === focusedIndex + 1) {
          variant = "next"; // The item immediately following the focused one
        } else {
          // Items within a certain range (2 items above/below) of the focused item are visible
          const isWithinVisibleRange = Math.abs(index - focusedIndex) <= 2;
          if (isWithinVisibleRange) {
            variant = "visible";
          }
        }

        return (
          <motion.div
            key={index} // Unique key for React list rendering
            className="w-full" // Full width items
            variants={itemVariants} // Apply defined animation variants
            initial="hidden" // Initial animation state
            animate={variant} // Animate to this variant based on scroll position
            // Set the height of each individual item.
            style={{
              minHeight: itemHeight ? `${itemHeight}px` : "auto",
            }}
          >
            {renderItem(item, index)}
          </motion.div>
        );
      })}
    </div>
  );
};

export default ScrollList;
