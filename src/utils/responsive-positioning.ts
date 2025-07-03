import type {
  Widget,
  ContainerDimensions,
  CalculatedPosition,
  EdgeDistances,
  AnchorConfig,
} from '@/types/widget'

/**
 * Calculate edge distances for a widget within a container
 */
export function calculateEdgeDistances(
  x: number,
  y: number,
  width: number,
  height: number,
  container: ContainerDimensions,
): EdgeDistances {
  return {
    left: x,
    right: container.width - (x + width),
    top: y,
    bottom: container.height - (y + height),
  }
}

/**
 * Determine the best anchor edges based on current position
 */
export function determineAnchorEdges(
  x: number,
  y: number,
  width: number,
  height: number,
  container: ContainerDimensions,
): AnchorConfig {
  const distances = calculateEdgeDistances(x, y, width, height, container)

  // Choose horizontal anchor (left vs right)
  const horizontal = distances.left <= distances.right ? 'left' : 'right'

  // Choose vertical anchor (top vs bottom)
  const vertical = distances.top <= distances.bottom ? 'top' : 'bottom'

  return { horizontal, vertical }
}

/**
 * Determine anchor edges with stability - once anchored, maintain anchor unless moved significantly
 */
export function determineStableAnchorEdges(
  x: number,
  y: number,
  width: number,
  height: number,
  container: ContainerDimensions,
  currentAnchor?: AnchorConfig,
): AnchorConfig {
  const distances = calculateEdgeDistances(x, y, width, height, container)

  // If no current anchor, use normal logic
  if (!currentAnchor) {
    return determineAnchorEdges(x, y, width, height, container)
  }

  // Define threshold for switching anchors (20% of container size)
  const horizontalThreshold = container.width * 0.2
  const verticalThreshold = container.height * 0.2

  // Determine if we should switch horizontal anchor
  let horizontal = currentAnchor.horizontal
  if (currentAnchor.horizontal === 'left' && distances.right < horizontalThreshold) {
    horizontal = 'right'
  } else if (currentAnchor.horizontal === 'right' && distances.left < horizontalThreshold) {
    horizontal = 'left'
  }

  // Determine if we should switch vertical anchor
  let vertical = currentAnchor.vertical
  if (currentAnchor.vertical === 'top' && distances.bottom < verticalThreshold) {
    vertical = 'bottom'
  } else if (currentAnchor.vertical === 'bottom' && distances.top < verticalThreshold) {
    vertical = 'top'
  }

  return { horizontal, vertical }
}

/**
 * Convert pixel position to percentage-based responsive configuration
 */
export function pixelToResponsive(
  x: number,
  y: number,
  width: number,
  height: number,
  container: ContainerDimensions,
  currentAnchor?: AnchorConfig,
): Widget['responsive'] {
  const anchorEdges = determineStableAnchorEdges(x, y, width, height, container, currentAnchor)

  let left: number | undefined
  let right: number | undefined
  let top: number | undefined
  let bottom: number | undefined

  // Calculate position based on anchor edges
  if (anchorEdges.horizontal === 'left') {
    left = (x / container.width) * 100
  } else {
    right = ((container.width - (x + width)) / container.width) * 100
  }

  if (anchorEdges.vertical === 'top') {
    top = (y / container.height) * 100
  } else {
    bottom = ((container.height - (y + height)) / container.height) * 100
  }

  return {
    left,
    right,
    top,
    bottom,
    widthPercent: Math.max(5, (width / container.width) * 100), // Minimum 5% width
    heightPercent: Math.max(3, (height / container.height) * 100), // Minimum 3% height
    minWidth: Math.max(80, width * 0.3), // Minimum 80px or 30% of current
    minHeight: Math.max(40, height * 0.3), // Minimum 40px or 30% of current
    anchorEdges,
    enabled: true,
  }
}

/**
 * Convert responsive configuration to pixel position
 */
export function responsiveToPixel(
  responsive: NonNullable<Widget['responsive']>,
  container: ContainerDimensions,
): CalculatedPosition {
  // Calculate width and height with proper minimum enforcement
  const calculatedWidth = Math.max(
    ((responsive.widthPercent || 20) * container.width) / 100,
    0, // Start with raw percentage
  )
  const calculatedHeight = Math.max(
    ((responsive.heightPercent || 15) * container.height) / 100,
    0, // Start with raw percentage
  )

  // Apply constraints
  const width = Math.max(
    responsive.minWidth || 80,
    Math.min(responsive.maxWidth || container.width, calculatedWidth),
  )

  const height = Math.max(
    responsive.minHeight || 40,
    Math.min(responsive.maxHeight || container.height, calculatedHeight),
  )

  // Calculate position based on anchor edges
  let x: number
  let y: number

  if (responsive.anchorEdges.horizontal === 'left') {
    x = ((responsive.left || 0) * container.width) / 100
  } else if (responsive.anchorEdges.horizontal === 'right') {
    x = container.width - width - ((responsive.right || 0) * container.width) / 100
  } else {
    // Center
    x = (container.width - width) / 2
  }

  if (responsive.anchorEdges.vertical === 'top') {
    y = ((responsive.top || 0) * container.height) / 100
  } else if (responsive.anchorEdges.vertical === 'bottom') {
    y = container.height - height - ((responsive.bottom || 0) * container.height) / 100
  } else {
    // Center
    y = (container.height - height) / 2
  }

  // Ensure position is within bounds
  x = Math.max(0, Math.min(container.width - width, x))
  y = Math.max(0, Math.min(container.height - height, y))

  return { x, y, width, height }
}

/**
 * Update widget's responsive configuration after drag/resize
 */
export function updateWidgetResponsive(
  widget: Widget,
  newX: number,
  newY: number,
  newWidth: number,
  newHeight: number,
  container: ContainerDimensions,
): Widget {
  // Update legacy pixel values
  const updatedWidget = {
    ...widget,
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight,
  }

  // Update responsive configuration if enabled
  if (widget.responsive?.enabled) {
    const newResponsive = pixelToResponsive(
      newX,
      newY,
      newWidth,
      newHeight,
      container,
      widget.responsive.anchorEdges, // Pass current anchor for stability
    )
    updatedWidget.responsive = {
      ...widget.responsive,
      ...newResponsive,
    }
  }

  return updatedWidget
}

/**
 * Update widget position and size together (prevents race conditions)
 */
export function updateWidgetPositionAndSize(
  widget: Widget,
  newX: number,
  newY: number,
  newWidth: number,
  newHeight: number,
  container: ContainerDimensions,
): Widget {
  return updateWidgetResponsive(widget, newX, newY, newWidth, newHeight, container)
}

/**
 * Calculate final position for rendering (supports both legacy and responsive)
 */
export function calculateWidgetPosition(
  widget: Widget,
  container: ContainerDimensions,
): CalculatedPosition {
  if (widget.responsive?.enabled) {
    return responsiveToPixel(widget.responsive, container)
  }

  // Fallback to legacy positioning
  return {
    x: widget.x,
    y: widget.y,
    width: widget.width,
    height: widget.height,
  }
}

/**
 * Convert existing widget to responsive positioning
 */
export function convertWidgetToResponsive(widget: Widget, container: ContainerDimensions): Widget {
  if (widget.responsive?.enabled) {
    return widget // Already responsive
  }

  const responsive = pixelToResponsive(widget.x, widget.y, widget.width, widget.height, container)

  return {
    ...widget,
    responsive,
  }
}

/**
 * Batch update all widgets' positions after container resize
 */
export function recalculateAllWidgetPositions(
  widgets: Widget[],
  container: ContainerDimensions,
): Widget[] {
  return widgets.map((widget) => {
    if (widget.responsive?.enabled) {
      const newPosition = responsiveToPixel(widget.responsive, container)
      return {
        ...widget,
        x: newPosition.x,
        y: newPosition.y,
        width: newPosition.width,
        height: newPosition.height,
      }
    }
    return widget
  })
}

/**
 * Get container dimensions from DOM element
 */
export function getContainerDimensions(element: HTMLElement): ContainerDimensions {
  const rect = element.getBoundingClientRect()
  return {
    width: rect.width,
    height: rect.height,
  }
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
