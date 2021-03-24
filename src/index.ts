import type { IAbstractGraph, IBBox, INode } from '@antv/g6-core'
import { PluginBase } from '@antv/g6-plugin'

// From https://stackoverflow.com/a/13139830/5906565
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

const overlaps = (a: IBBox, b: IBBox) => {
  // No horizontal overlap?
  if (a.minX >= b.maxX || b.minX >= a.maxX) {
    return false
  }
  // No vertical overlap?
  if (a.minY >= b.maxY || b.minY >= a.maxY) {
    return false
  }
  return true
}

interface LazyLoadImagesConfig {
  placeholder?: string
}

class LazyLoadImages extends PluginBase {
  init() {}

  getDefaultCfgs(): LazyLoadImagesConfig {
    return {
      // This is needed because G6 won't load any of the images we set in `onViewportChange`
      // if there isn't a valid image set, be it a URL or data URI.
      placeholder: TRANSPARENT_PIXEL
    }
  }

  getEvents() {
    return {
      beforelayout: 'onBeforeLayout',
      viewportchange: 'onViewportChange'
    }
  }

  protected onBeforeLayout() {
    const placeholder: string = this.get('placeholder')
    if (!placeholder) {
      return
    }
    const lazyNodes = this.getLazyNodes()
    if (lazyNodes.length === 0) {
      return
    }

    const graph: IAbstractGraph = this.get('graph')
    graph.setAutoPaint(false)

    // Set placeholder images
    lazyNodes.forEach(node => {
      node.update({ img: placeholder })
    })

    graph.paint()
    graph.setAutoPaint(true)
  }

  protected onViewportChange() {
    this.loadLoadableNodes()
  }

  destroy() {}

  private loadLoadableNodes() {
    const loadableNodes = this.getLoadableNodes()
    if (loadableNodes.length === 0) {
      return
    }

    const graph: IAbstractGraph = this.get('graph')
    graph.setAutoPaint(false)

    // Replace with actual images
    loadableNodes.forEach(node => {
      const imgSrc = node.getModel().imgLazy as string
      // Remove imgLazy immediately to prevent it from being loaded from multiple
      // times. This occurs when other `viewportchange` events are fired while
      // this instance of the image is still being loaded.
      node.update({ imgLazy: undefined })

      const img = new Image()
      img.onload = () => {
        // Only show the image once it has fully loaded
        node.update({ img })
      }
      img.src = imgSrc
    })

    graph.paint()
    graph.setAutoPaint(true)
  }

  private getLoadableNodes() {
    return this.getLazyNodes().filter(node => this.isNodeInViewport(node))
  }

  private getLazyNodes() {
    const graph: IAbstractGraph = this.get('graph')
    return graph
      .getNodes()
      .filter(node => node.getModel().type === 'image')
      .filter(node => node.getModel().imgLazy !== undefined)
  }

  private isNodeInViewport(node: INode) {
    return overlaps(node.getBBox(), this.getViewportBoundingBox())
  }

  private getViewportBoundingBox(): IBBox {
    const graph: IAbstractGraph = this.get('graph')
    const viewCenter = graph.getViewPortCenterPoint()
    const canvasCenter = graph.getCanvasByPoint(viewCenter.x, viewCenter.y)
    const topLeftCorner = graph.getPointByCanvas(
      canvasCenter.x - graph.getWidth() / 2,
      canvasCenter.y - graph.getHeight() / 2
    )
    const bottomRightCorner = graph.getPointByCanvas(
      canvasCenter.x + graph.getWidth() / 2,
      canvasCenter.y + graph.getHeight() / 2
    )
    return {
      x: topLeftCorner.x,
      y: topLeftCorner.y,
      minX: topLeftCorner.x,
      minY: topLeftCorner.y,
      maxX: bottomRightCorner.x,
      maxY: bottomRightCorner.y,
      height: bottomRightCorner.y - topLeftCorner.y,
      width: bottomRightCorner.x - topLeftCorner.x
    }
  }
}

export default LazyLoadImages
