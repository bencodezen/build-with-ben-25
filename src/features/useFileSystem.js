export const getNewFileHandle = async () => {
  const options = {
    types: [
      {
        description: 'JSON Files',
        accept: {
          'text/plain': ['.json']
        }
      }
    ]
  }
  const handle = await window.showSaveFilePicker(options)
  return handle
}

export const writeFile = async (fileHandle, contents) => {
  // Create a FileSystemWritableFileStream to write to.
  const writable = await fileHandle.createWritable()
  // Write the contents of the file to the stream.
  await writable.write(contents)
  // Close the file and write the contents to disk.
  await writable.close()
}
