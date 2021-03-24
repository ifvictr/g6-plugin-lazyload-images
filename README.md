# g6-plugin-lazyload-images

Image lazy-loading plugin for AntV’s [G6](https://github.com/antvis/G6) engine.

Here’s a side-by-side comparison of what a graph might look like, before and after the plugin is added. The network connection is throttled down to fast 3G to highlight the difference:

<table>
  <tr>
    <th width="50%">Before</th>
    <th width="50%">After</th>
  </tr>
  <tr>
    <td width="50%">
      <img src="https://files.ifvictr.com/2021/03/g6-plugin-lazyload-images-before.gif" />
    </td>
    <td width="50%">
      <img src="https://files.ifvictr.com/2021/03/g6-plugin-lazyload-images-after.gif" />
    </td>
  </tr>
</table>

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
  // You can use an external image here, but a data URI is preferable.
  placeholder: 'data:image/svg+xml;base64,…'
})

const graph = new G6.Graph({
  // Other configurations here…
  plugins: [lazyLoadImages]
})
```

To start lazy loading images, you’ll need to make some slight modifications to the image node model when you add it to the graph:

```js
// Before
graph.addItem('node', {
  type: 'image',
  img: 'https://example.com/myimage.png'
})

// After
graph.addItem('node', {
  type: 'image',
  img: '',
  imgLazy: 'https://example.com/myimage.png'
})
```

It’s paramount that you set the `img` key to an empty string. Otherwise, G6 will use its own fallback image before the placeholder is injected and you’ll see a flash of that image.

## License

[MIT License](LICENSE.txt)
