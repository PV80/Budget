#!/usr/bin/env python3
"""Generates PNG app icons for the PWA build."""
import struct, zlib, os

def make_png(size):
    w = h = size
    BG = (30, 27, 75)   # #1e1b4b indigo
    FG = (255, 255, 255)
    corner = max(1, int(w * 0.15))

    pixels = []
    for y in range(h):
        row = bytearray()
        for x in range(w):
            dx, dy = min(x, w-1-x), min(y, h-1-y)
            if dx < corner and dy < corner:
                dist = ((corner-dx)**2 + (corner-dy)**2) ** 0.5
                if dist > corner:
                    row += bytes([0, 0, 0, 0])
                    continue
            row += bytes([BG[0], BG[1], BG[2], 255])
        pixels.append(bytes(row))

    # Draw $ symbol
    cx, cy = w // 2, h // 2
    sym = int(size * 0.55)
    sx, sy = cx - sym // 2, cy - sym // 2
    bw = max(2, sym // 6)
    sl, sr = cx - sym // 3, cx + sym // 3

    def dot(px, py):
        if 0 <= px < w and 0 <= py < h:
            row = bytearray(pixels[py])
            row[px*4:px*4+4] = bytes([FG[0], FG[1], FG[2], 255])
            pixels[py] = bytes(row)

    for y in range(sy - sym//8, sy + sym + sym//8):
        for b in range(bw): dot(cx - bw//2 + b, y)
    for px in range(sl, sr):
        for t in range(bw):
            dot(px, sy + t)
            dot(px, cy - bw//2 + t)
            dot(px, sy + sym - bw + t)
    for y in range(sy, cy - bw//2):
        for b in range(bw): dot(sr - bw + b, y)
    for y in range(cy + bw//2, sy + sym):
        for b in range(bw): dot(sl + b, y)

    def chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    raw = b''.join(b'\x00' + row for row in pixels)
    return (
        b'\x89PNG\r\n\x1a\n'
        + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0))
        + chunk(b'IDAT', zlib.compress(raw, 6))
        + chunk(b'IEND', b'')
    )

os.makedirs('public', exist_ok=True)
for size in [32, 180, 192, 512]:
    path = f'public/icon-{size}.png'
    with open(path, 'wb') as f:
        f.write(make_png(size))
    print(f'  {path} ({size}x{size})')
