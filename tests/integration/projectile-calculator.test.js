import { describe, test, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

// Mock the calculator modules
vi.mock('../../src/utils/physics-constants.js', () => ({
  PHYSICS_CONSTANTS: {
    GRAVITY: 9.81,
    AIR_DENSITY: 1.225,
    BASEBALL_MASS: 0.145,
    BASEBALL_RADIUS: 0.0366,
    DRAG_COEFFICIENT: 0.3,
    MAGNUS_COEFFICIENT: 0.1
  }
}))

vi.mock('../../src/utils/calculator-utilities.js', () => ({
  roundToDecimal: (value, decimals = 2) => Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals),
  createSlider: vi.fn((container, id, label, min, max, value, step, unit) => {
    const slider = document.createElement('input')
    slider.type = 'range'
    slider.id = id
    slider.min = min
    slider.max = max
    slider.value = value
    slider.step = step
    slider.className = 'physics-slider'
    
    const sliderContainer = document.createElement('div')
    sliderContainer.className = 'slider-container'
    sliderContainer.appendChild(slider)
    container.appendChild(sliderContainer)
    
    return slider
  }),
  createCanvas: vi.fn((container, width = 400, height = 300) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.className = 'physics-canvas'
    
    // Mock canvas context
    const mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 1,
      font: '12px Arial'
    }
    
    canvas.getContext = vi.fn(() => mockContext)
    container.appendChild(canvas)
    return canvas
  })
}))

// Import after mocks are set up
const { ProjectileMotionCalculator } = await import('../../src/components/calculators/projectile-motion.js')

describe('ProjectileMotionCalculator Integration', () => {
  let dom, document, container, calculator

  beforeEach(() => {
    // Set up DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body><div id="test-container"></div></body></html>')
    global.document = dom.window.document
    global.window = dom.window
    global.HTMLElement = dom.window.HTMLElement
    
    container = dom.window.document.getElementById('test-container')
    calculator = new ProjectileMotionCalculator(container)
  })

  describe('Initialization', () => {
    test('should create calculator with default values', () => {
      expect(calculator.velocity).toBe(30)
      expect(calculator.angle).toBe(25)
      expect(calculator.height).toBe(1.8)
      expect(calculator.airResistance).toBe(false)
    })

    test('should create DOM elements', () => {
      expect(container.className).toBe('projectile-calculator')
      expect(container.querySelector('.calculator-title')).toBeTruthy()
      expect(container.querySelector('.calculator-controls')).toBeTruthy()
      expect(container.querySelector('.calculation-results')).toBeTruthy()
      expect(container.querySelector('.physics-canvas')).toBeTruthy()
    })

    test('should create sliders with correct attributes', () => {
      const velocitySlider = container.querySelector('#velocity')
      const angleSlider = container.querySelector('#angle')
      const heightSlider = container.querySelector('#height')
      
      expect(velocitySlider.min).toBe('10')
      expect(velocitySlider.max).toBe('50')
      expect(velocitySlider.value).toBe('30')
      
      expect(angleSlider.min).toBe('0')
      expect(angleSlider.max).toBe('90')
      expect(angleSlider.value).toBe('25')
      
      expect(heightSlider.min).toBe('0')
      expect(heightSlider.max).toBe('5')
      expect(heightSlider.value).toBe('1.8')
    })
  })

  describe('User Interactions', () => {
    test('should update calculation when velocity slider changes', () => {
      const velocitySlider = container.querySelector('#velocity')
      
      // Simulate user input
      velocitySlider.value = '40'
      velocitySlider.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      
      expect(calculator.velocity).toBe(40)
      
      // Check if results are updated
      const resultsDiv = container.querySelector('.calculation-results')
      expect(resultsDiv.innerHTML).toContain('Time of Flight')
      expect(resultsDiv.innerHTML).toContain('Maximum Height')
      expect(resultsDiv.innerHTML).toContain('Horizontal Range')
    })

    test('should update calculation when angle slider changes', () => {
      const angleSlider = container.querySelector('#angle')
      
      angleSlider.value = '45'
      angleSlider.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      
      expect(calculator.angle).toBe(45)
    })

    test('should toggle air resistance', () => {
      const airCheckbox = container.querySelector('#air-resistance')
      
      expect(calculator.airResistance).toBe(false)
      
      airCheckbox.checked = true
      airCheckbox.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      
      expect(calculator.airResistance).toBe(true)
    })
  })

  describe('Calculation Updates', () => {
    test('should display calculation results', () => {
      const resultsDiv = container.querySelector('.calculation-results')
      
      expect(resultsDiv).toBeTruthy()
      expect(resultsDiv.innerHTML).toContain('Time of Flight:')
      expect(resultsDiv.innerHTML).toContain('Maximum Height:')
      expect(resultsDiv.innerHTML).toContain('Horizontal Range:')
      expect(resultsDiv.innerHTML).toContain('Impact Velocity:')
    })

    test('should update results when parameters change', () => {
      const velocitySlider = container.querySelector('#velocity')
      const resultsDiv = container.querySelector('.calculation-results')
      
      // Get initial range value
      const initialResults = resultsDiv.innerHTML
      
      // Change velocity
      velocitySlider.value = '50'
      velocitySlider.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      
      // Results should have changed
      const newResults = resultsDiv.innerHTML
      expect(newResults).not.toBe(initialResults)
    })

    test('should show different results with air resistance', () => {
      const airCheckbox = container.querySelector('#air-resistance')
      const resultsDiv = container.querySelector('.calculation-results')
      
      // Get results without air resistance
      const noAirResults = resultsDiv.innerHTML
      
      // Enable air resistance
      airCheckbox.checked = true
      airCheckbox.dispatchEvent(new dom.window.Event('change', { bubbles: true }))
      
      // Results should be different
      const airResults = resultsDiv.innerHTML
      expect(airResults).not.toBe(noAirResults)
    })
  })

  describe('Canvas Visualization', () => {
    test('should create canvas element', () => {
      const canvas = container.querySelector('.physics-canvas')
      expect(canvas).toBeTruthy()
      expect(canvas.width).toBe(500)
      expect(canvas.height).toBe(350)
    })

    test('should call canvas drawing methods', () => {
      const canvas = container.querySelector('.physics-canvas')
      const context = canvas.getContext('2d')
      
      // Trigger an update to cause drawing
      const velocitySlider = container.querySelector('#velocity')
      velocitySlider.value = '35'
      velocitySlider.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      
      // Check that drawing methods were called
      expect(context.clearRect).toHaveBeenCalled()
      expect(context.beginPath).toHaveBeenCalled()
      expect(context.stroke).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    test('should handle invalid slider values', () => {
      const velocitySlider = container.querySelector('#velocity')
      
      // Set invalid value
      velocitySlider.value = 'invalid'
      velocitySlider.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      
      // Should default to 0 or handle gracefully
      expect(typeof calculator.velocity).toBe('number')
    })

    test('should handle missing DOM elements gracefully', () => {
      // Create calculator with empty container
      const emptyContainer = dom.window.document.createElement('div')
      
      expect(() => {
        new ProjectileMotionCalculator(emptyContainer)
      }).not.toThrow()
    })
  })

  describe('Physics Validation in UI', () => {
    test('should show realistic values for typical baseball parameters', () => {
      const velocitySlider = container.querySelector('#velocity')
      const angleSlider = container.querySelector('#angle')
      const resultsDiv = container.querySelector('.calculation-results')
      
      // Set typical baseball parameters
      velocitySlider.value = '40'
      angleSlider.value = '30'
      velocitySlider.dispatchEvent(new dom.window.Event('input', { bubbles: true }))
      
      // Check that results are in realistic ranges
      const resultsText = resultsDiv.textContent
      
      // Should have reasonable time of flight (1-5 seconds)
      expect(resultsText).toMatch(/Time of Flight: [1-5]\.\d+/)
      
      // Should have reasonable range (50-200 meters)
      expect(resultsText).toMatch(/Range: [5-9]\d\.\d+|1[0-9]\d\.\d+/)
    })
  })
})