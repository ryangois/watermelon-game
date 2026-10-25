"""Split the generated atlas and measure visible sprite geometry (Pillow)."""
from pathlib import Path
import json
import math
import sys
from collections import deque
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
NAMES = ['cherries', 'strawberry', 'grapes', 'orange', 'apple', 'pear', 'peach', 'pineapple', 'melon', 'watermelon', 'jackfruit']
PACKS = ['Christmas', 'Sideral', 'Mythology', 'Ocean', 'Robot', 'Candy', 'Luxury']

if len(sys.argv) > 1:
    atlas = Image.open(sys.argv[1]).convert('RGBA')
    atlas.save(ROOT / 'assets/images/skin-atlas.png')
    pixels = np.asarray(atlas)
    row_occupancy = (pixels[:, :, 3] > 64).sum(axis=1)
    ys = [0]
    for row in range(1, 7):
        expected = round(row * atlas.height / 7)
        start, end = max(ys[-1] + 1, expected - 24), expected + 25
        ys.append(start + int(np.argmin(row_occupancy[start:end])))
    ys.append(atlas.height)
    for row, pack in enumerate(PACKS):
        # Locate transparent gutters locally; the atlas is not pixel-perfect.
        band = np.asarray(atlas)[ys[row]:ys[row + 1], :, 3]
        occupancy = (band > 64).sum(axis=0)
        xs = [0]
        for col in range(1, 11):
            expected = round(col * atlas.width / 11)
            start, end = max(xs[-1] + 1, expected - 23), expected + 24
            xs.append(start + int(np.argmin(occupancy[start:end])))
        xs.append(atlas.width)
        folder = ROOT / 'assets/images' / pack
        folder.mkdir(exist_ok=True)
        for col, name in enumerate(NAMES):
            sprite = atlas.crop((xs[col], ys[row], xs[col + 1], ys[row + 1]))
            # Remove tiny disconnected remnants from neighboring atlas cells.
            rgba = np.array(sprite)
            mask = rgba[:, :, 3] > 16
            seen = np.zeros(mask.shape, dtype=bool)
            groups = []
            for y, x in zip(*np.where(mask)):
                if seen[y, x]:
                    continue
                queue = deque([(int(y), int(x))])
                seen[y, x] = True
                group = []
                while queue:
                    gy, gx = queue.popleft()
                    group.append((gy, gx))
                    for ny, nx in [(gy-1,gx), (gy+1,gx), (gy,gx-1), (gy,gx+1)]:
                        if 0 <= ny < mask.shape[0] and 0 <= nx < mask.shape[1] and mask[ny,nx] and not seen[ny,nx]:
                            seen[ny,nx] = True
                            queue.append((ny,nx))
                groups.append(group)
            largest = max(map(len, groups))
            for group in groups:
                if len(group) < largest * .06:
                    for gy, gx in group:
                        rgba[gy, gx, 3] = 0
            sprite = Image.fromarray(rgba)
            sprite = sprite.crop(sprite.getbbox())
            sprite.save(folder / f'{name}_emoji.png')

# Alpha area gives each costume the same visible mass, independently of source
# resolution or transparent padding. The alpha centroid keeps that mass centered.
metrics = {}
for folder in ['', 'Halloween'] + PACKS:
    for name in NAMES:
        path = ROOT / 'assets/images' / folder / f'{name}_emoji.png'
        im = Image.open(path).convert('RGBA')
        alpha = im.getchannel('A')
        weights = np.asarray(alpha, dtype=float)
        mass = weights.sum()
        cx = float((weights.sum(axis=0) * (np.arange(im.width) + .5)).sum() / mass)
        cy = float((weights.sum(axis=1) * (np.arange(im.height) + .5)).sum() / mass)
        metrics[path.relative_to(ROOT).as_posix()] = {
            'radius': round(math.sqrt(mass / 255 / math.pi), 3),
            'xOffset': round(cx / im.width, 5),
            'yOffset': round(cy / im.height, 5),
            'bounds': alpha.getbbox(), 'width': im.width, 'height': im.height,
        }
(ROOT / 'js/sprite-metrics.js').write_text(
    'var SuikaGame = SuikaGame || {};\nSuikaGame.spriteMetrics = ' + json.dumps(metrics, separators=(',', ':')) + ';\n', encoding='utf-8')
