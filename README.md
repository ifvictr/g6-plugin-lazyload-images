# g6-plugin-lazyload-images

Image lazy-loading plugin for AntV’s G6 engine.

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

To start lazy loading images, you’ll need to slightly change the model of your nodes where you first add it to the graph:

```js
graph.addItem('image', {
  // Before
  img: 'https://example.com/myimage.png'

  // After
  img: '',
  imgLazy: 'https://example.com/myimage.png'
})
```

It’s paramount that you set the `img` key to an empty string. Otherwise, G6 will use the fallback image when the graph is first loaded, before the plugin replaces the node’s image with the placeholder.

## License

[MIT License](LICENSE.txt)