# Mellow Cloud Animation System

A comprehensive animation system for the Mellow landing page that makes buttons, text, logos, and card elements float in a cloud-like manner.

## Animation Components

### 1. FloatingElement

The primary component for adding cloud-like floating animations to any element.

```tsx
<FloatingElement 
  preset="cloudFloat"
  delay={500}
  addVariance={true}
  className="your-class-name"
>
  <YourComponent />
</FloatingElement>
```

**Available presets:**
- `cloudFloat` - Gentle up/down movement with slight rotation
- `buttonFloat` - Subtle hover effect for buttons
- `textFloat` - Text emphasis animation
- `cardFloat` - Card element floating with multi-directional movement
- `logoFloat` - Logo animation with slight scaling

### 2. SimpleTextAnimation

A simplified text component that preserves HTML structure (like `<br>` tags) while adding fade-in and floating effects.

```tsx
<SimpleTextAnimation 
  delay={1000}
  floatDelay={500}
  className="text-class"
>
  Text with <br/> line breaks
</SimpleTextAnimation>
```

### 3. TextAnimation

Advanced text animation with options to split text by letters or words for more detailed effects.

```tsx
<TextAnimation 
  type="fadeIn" 
  delay={1000} 
  staggerDelay={20} 
  splitBy="word"
  className="text-class"
>
  Animate each word
</TextAnimation>
```

**Animation types:**
- `fadeIn` - Standard fade in with slight movement
- `typewriter` - Typewriter effect that adds characters one by one
- `wavy` - Creates a wave-like effect through the text
- `highlight` - Briefly highlights the text

### 4. AnimatedButton

A button component with built-in animations for floating and hover effects.

```tsx
<AnimatedButton
  onClick={handleClick}
  floatDelay={1500}
  className="button-class"
>
  Button Text
</AnimatedButton>
```

### 5. FadeIn

Simple fade-in effect with optional floating animation.

```tsx
<FadeIn 
  delay={300} 
  duration={800}
  float={true} 
  floatPreset="textFloat"
>
  Content to fade in
</FadeIn>
```

### 6. WithAnimation

A higher-order component to easily add animations to any element.

```tsx
<WithAnimation
  type="float"
  delay={500}
  preset="cloudFloat"
>
  <div>Your content</div>
</WithAnimation>
```

**Animation types:**
- `float` - Floating animation
- `text` - Text animation
- `button` - Button animation
- `none` - No animation

### 7. ScrollReveal

A component that triggers animations when elements enter the viewport during scrolling.

```tsx
<ScrollReveal
  type="fade"
  threshold={0.3}
  delay={200}
  duration={800}
  className="your-class-name"
>
  <div>Content revealed on scroll</div>
</ScrollReveal>
```

**Animation types:**
- `fade` - Simple fade-in when scrolled into view
- `float` - Fade-in followed by floating animation
- `text` - Text animation with various effects
- `simpleText` - Preserves HTML structure (like `<br>` tags)
- `button` - Button animation with floating effect
- `custom` - Custom animation with your own anime.js parameters

**Options:**
- `threshold` - How much of the element needs to be visible to trigger (0-1)
- `rootMargin` - Margin around the viewport (e.g., "50px 0px")
- `triggerOnce` - Whether to trigger only once or every time element enters viewport
- `debug` - Shows a red outline to help with positioning

## Animation Orchestrator

The `AnimationOrchestrator` helps coordinate animations across multiple components.

```tsx
<AnimationOrchestrator autoInit={true} initDelay={200}>
  <App />
</AnimationOrchestrator>
```

You can use the `useAnimation` hook to access the orchestrator context:

```tsx
const { isInitialized, triggerAnimation, registerAnimation } = useAnimation();

// Register animation
useEffect(() => {
  registerAnimation("my-animation", 500);
}, []);

// Trigger animation manually
const handleClick = () => {
  triggerAnimation("my-animation");
};
```

## Animation Utilities

The system includes utility functions in `AnimationUtils.ts`:

- `createAnimation(targets, preset, customParams)` - Create an anime.js animation
- `addRandomness(preset, durationVariance, delayVariance)` - Add randomness to animation params
- `randomInRange(min, max)` - Generate random number in range

## Best Practices

1. Use the `FloatingElement` component for simple cloud-like animations
2. Use `SimpleTextAnimation` for text with HTML elements
3. Use `TextAnimation` for advanced text effects
4. Use `AnimatedButton` for buttons
5. Use the `AnimationOrchestrator` to coordinate animations
6. Add randomness with `addVariance={true}` for more natural movements
7. Adjust timing between elements by using different delays
8. Use `ScrollReveal` for scroll-triggered animations
9. Set appropriate thresholds for scroll animations based on content size

## Implementation Example

```tsx
<section className="hero-section">
  <AnimationOrchestrator>
    <FloatingElement preset="logoFloat">
      <Logo className="logo" />
    </FloatingElement>
      <SimpleTextAnimation delay={300}>
      <h1>Main Heading<br/>with line break</h1>
    </SimpleTextAnimation>
    
    <AnimatedButton onClick={handleClick}>
      Call to Action
    </AnimatedButton>
  </AnimationOrchestrator>
</section>
```

## Scroll Animation Example

Here's an example of using scroll-based animations to create an engaging scrolling experience:

```tsx
<div className="landing-page">
  {/* Initial content that appears immediately */}
  <section className="hero">
    <AnimationOrchestrator>
      <FloatingElement preset="logoFloat">
        <Logo className="logo" />
      </FloatingElement>
      
      <SimpleTextAnimation delay={300}>
        <h1>Main Heading</h1>
      </SimpleTextAnimation>
    </AnimationOrchestrator>
  </section>
  
  {/* Content revealed on scroll */}
  <section className="features">
    <ScrollReveal 
      type="fade"
      threshold={0.3}
      delay={200}
      className="feature-card"
    >
      <h2>Feature 1</h2>
      <p>Description of the feature</p>
    </ScrollReveal>
    
    <ScrollReveal 
      type="float"
      threshold={0.3}
      delay={300}
      preset="cardFloat"
      className="feature-card"
    >
      <h2>Feature 2</h2>
      <p>Description with floating animation</p>
    </ScrollReveal>
    
    <ScrollReveal 
      type="text"
      textAnimationType="highlight"
      threshold={0.3}
      delay={100}
      className="feature-heading"
    >
      <h2>Feature 3</h2>
    </ScrollReveal>
    
    <ScrollReveal 
      type="button"
      threshold={0.2}
      delay={400}
    >
      <button className="cta-button">Learn More</button>
    </ScrollReveal>
    
    <ScrollReveal 
      type="custom"
      threshold={0.4}
      delay={200}
      customParams={{
        translateX: ['-100px', '0px'],
        rotate: ['45deg', '0deg'],
        easing: 'easeOutElastic(1, .6)'
      }}
      className="custom-animated-element"
    >
      <div>Custom Animation on Scroll</div>
    </ScrollReveal>
  </section>
</div>
```
    
    <AnimatedButton onClick={handleClick}>
      Call to Action
    </AnimatedButton>
  </AnimationOrchestrator>
</section>
```
