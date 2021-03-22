import type { IAbstractGraph } from '@antv/g6-core'
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
      node.update({ ...node.getModel(), img: placeholder })
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
      const model = node.getModel()
      const img = new Image()
      const newModel = { ...model, img, imgLazy: undefined }
      // Only show the image once it has fully loaded
      img.onload = () => {
        node.update(newModel)
      }
      img.src = model.imgLazy as string
    })

    graph.paint()
    graph.setAutoPaint(true)
  }

  destroy() {}

  private getVisibleLazyNodes() {
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

    // TODO: Get nodes right outside the viewport that are likely to be loaded if
    // the users moves around, then preload them.
    const nodes = this.getLazyNodes()
      .filter(node => node.getModel().img !== node.getModel().imgLazy) // Nodes that have yet to be loaded
      .filter(node => {
        const model = node.getModel()
        // TODO: Use the node's bounding box to see if any part of overlaps with
        // the viewport instead of just using its center.
        return (
          topLeftCorner.x <= model.x! &&
          model.x! <= bottomRightCorner.x &&
          topLeftCorner.y <= model.y! &&
          model.y! <= bottomRightCorner.y
        )
      })
    return nodes
  }

  private getLazyNodes() {
    const graph: IAbstractGraph = this.get('graph')
    return graph
      .getNodes()
      .filter(node => node.getModel().type === 'image')
      .filter(node => node.getModel().imgLazy !== undefined)
  }
}

export default LazyLoadImages
