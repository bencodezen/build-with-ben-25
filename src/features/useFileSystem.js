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
