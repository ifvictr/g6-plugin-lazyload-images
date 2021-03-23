import type { IAbstractGraph, INode } from '@antv/g6-core'
import { PluginBase } from '@antv/g6-plugin'

interface LazyLoadImagesConfig {
  placeholder?: string
}

class LazyLoadImages extends PluginBase {
  init() {}

  getDefaultCfgs(): LazyLoadImagesConfig {
    return {}
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
    const visibleLazyNodes = this.getVisibleLazyNodes()
    if (visibleLazyNodes.length === 0) {
      return
    }

    const graph: IAbstractGraph = this.get('graph')
    graph.setAutoPaint(false)

    // Replace with actual images
    visibleLazyNodes.forEach(node => {
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

  destroy() {}

  private getVisibleLazyNodes() {
    // TODO: Get nodes right outside the viewport that are likely to be loaded if
    // the users moves around, then preload them.
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
    const model = node.getModel()
    // TODO: Use the node's bounding box to see if any part of overlaps with
    // the viewport instead of just using its center.
    const viewportBBox = this.getViewportBoundingBox()
    return (
      viewportBBox.x <= model.x! &&
      model.x! <= viewportBBox.x + viewportBBox.width &&
      viewportBBox.y <= model.y! &&
      model.y! <= viewportBBox.y + viewportBBox.height
    )
  }

  private getViewportBoundingBox() {
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
      height: bottomRightCorner.y - topLeftCorner.y,
      width: bottomRightCorner.x - topLeftCorner.x,
      x: topLeftCorner.x,
      y: topLeftCorner.y
    }
  }
}

export default LazyLoadImages
