// tests/helpers/files.ts

/**
 * Creates a fake text file for tests.
 */
export function createTextFile(
  filename = 'test.txt',
  content = 'test file content',
): File {
  return new File(
    [content],
    filename,
    {
      type: 'text/plain',
    },
  )
}

/**
 * Creates a fake JPEG image file.
 */
export function createImageFile(
  filename = 'test.jpg',
  content = 'fake image data',
): File {
  return new File(
    [content],
    filename,
    {
      type: 'image/jpeg',
    },
  )
}

/**
 * Creates a fake PNG image file.
 */
export function createPngFile(
  filename = 'test.png',
  content = 'fake png data',
): File {
  return new File(
    [content],
    filename,
    {
      type: 'image/png',
    },
  )
}

/**
 * Creates a fake video file.
 */
export function createVideoFile(
  filename = 'test.mp4',
  content = 'fake video data',
): File {
  return new File(
    [content],
    filename,
    {
      type: 'video/mp4',
    },
  )
}

/**
 * Creates a fake 3D/model file.
 *
 * GLB is commonly used for 3D assets.
 */
export function create3DFile(
  filename = 'test.glb',
  content = 'fake 3d data',
): File {
  return new File(
    [content],
    filename,
    {
      type: 'model/gltf-binary',
    },
  )
}

/**
 * Creates an empty file.
 * Useful for testing file size validation.
 */
export function createEmptyFile(
  filename = 'empty.jpg',
  mimeType = 'image/jpeg',
): File {
  return new File(
    [],
    filename,
    {
      type: mimeType,
    },
  )
}

/**
 * Creates a file larger than the specified size.
 *
 * Useful for testing MAX_UPLOAD_SIZE validation.
 */
export function createLargeFile(
  sizeInBytes: number,
  filename = 'large.jpg',
  mimeType = 'image/jpeg',
): File {
  const content = new Uint8Array(sizeInBytes)

  return new File(
    [content],
    filename,
    {
      type: mimeType,
    },
  )
}

/**
 * Creates a file with a filename containing characters
 * that should be sanitized by the API.
 */
export function createFileWithUnsafeFilename(): File {
  return new File(
    ['fake image data'],
    'my image @#$%.jpg',
    {
      type: 'image/jpeg',
    },
  )
}

/**
 * Creates a generic file with custom type/content.
 */
export function createFile(
  filename: string,
  mimeType: string,
  content = 'test content',
): File {
  return new File(
    [content],
    filename,
    {
      type: mimeType,
    },
  )
}