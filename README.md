# g6-plugin-lazyload-images

Image lazy-loading plugin for AntV’s [G6](https://github.com/antvis/G6) engine.

## Installation

```bash
npm install g6-plugin-lazyload-images
```

## Usage

Start off by instantiating the plugin and adding it to the graph:

```js
import G6 from '@antv/g6'
import LazyLoadImages from 'g6-plugin-lazyload-images'

const lazyLoadImages = new LazyLoadImages({
  placeholder: 'https://example.com/placeholder.png'
})

const graph = new G6.Graph({
  // Other configurations here…
  plugins: [lazyLoadImages]
})
```

To start lazy loading images, you’ll need to make some slight modifications to the image node model when you add it to the graph:

```js
// Before
graph.addItem('image', {
  img: 'https://example.com/myimage.png'
})

// After
graph.addItem('image', {
  img: '',
  imgLazy: 'https://example.com/myimage.png'
})
```

It’s paramount that you set the `img` key to an empty string. Otherwise, G6 will use their own image when the graph is first loaded, before the placeholder is injected into the node.

## License

[MIT License](LICENSE.txt)
