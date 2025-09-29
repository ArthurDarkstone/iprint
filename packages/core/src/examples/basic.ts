import { init, PrintTemplate } from '../iprint'

/**
 * Basic usage example
 */
export function createBasicTemplate(): PrintTemplate {
  // Initialize iprint
  init()

  // Create a new print template
  const template = new PrintTemplate()

  // Add a print panel (A4 size)
  const panel = template.addPrintPanel({
    width: 210, // A4 width in mm
    height: 297, // A4 height in mm
    paperHeader: 10,
    paperFooter: 280,
  })

  // Add text elements
  panel.printElements.push({
    options: {
      left: 20,
      top: 20,
      width: 100,
      height: 20,
      title: 'Hello World',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000000',
      textAlign: 'left',
    },
    printElementType: {
      title: '文本',
      type: 'text',
    },
  })

  // Add a horizontal line
  panel.printElements.push({
    options: {
      left: 20,
      top: 50,
      width: 170,
      height: 1,
      borderColor: '#000000',
      borderWidth: 1,
    },
    printElementType: {
      title: '横线',
      type: 'hline',
    },
  })

  // Add a rectangle
  panel.printElements.push({
    options: {
      left: 20,
      top: 70,
      width: 100,
      height: 50,
      borderColor: '#000000',
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    printElementType: {
      title: '矩形',
      type: 'rect',
    },
  })

  return template
}

/**
 * Example with data
 */
export function createDataTemplate(): PrintTemplate {
  const template = new PrintTemplate()

  const panel = template.addPrintPanel({
    width: 210,
    height: 297,
  })

  // Add dynamic text elements
  panel.printElements.push({
    options: {
      left: 20,
      top: 20,
      width: 100,
      height: 20,
      title: 'Name:',
      fontSize: 12,
      field: 'name',
    },
    printElementType: {
      title: '文本',
      type: 'text',
    },
  })

  panel.printElements.push({
    options: {
      left: 20,
      top: 50,
      width: 100,
      height: 20,
      title: 'Email:',
      fontSize: 12,
      field: 'email',
    },
    printElementType: {
      title: '文本',
      type: 'text',
    },
  })

  return template
}
