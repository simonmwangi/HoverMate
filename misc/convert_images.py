from PIL import Image

image_path = 'icon.png'
image = Image.open(image_path)

sizes = [(16, 16), (48, 48), (128, 128)]
resized_images = {}

for size in sizes:
    resized_image = image.resize(size, Image.ANTIALIAS)
    resized_images[size] = resized_image

output_paths = {}
for size, resized_image in resized_images.items():
    output_path = f'icon_{size[0]}x{size[1]}.png'
    resized_image.save(output_path)
    output_paths[size] = output_path

