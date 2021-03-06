# Component Spec

There are 3 types of component: UiComponent and Library

## UiComponent ---------------- 
//TODO - UiComponent rename to Interaction

### How to depend on a library

## Layout Component -------------------

A layout component is a component that only has logic that 
provides layouts within an item. For example: Tabs, Carousel, Expanders etc.

* no server side logic required
* can not be configured using a ui component instead they are added to the item xhtml

The container decides to include the components by inspecting the Item.xhtml property for usage.

### Defining
### Adding multiple items

## Library ----------------

This spec defines how to create a component that can run within a org.corespring container.

A component is a self contained unit that defines client side behaviour and server side processing.

On the client side the component must support the following modes:
* render mode - how the client looks/behaves when rendered to the student
* config mode - how the client looks/behaves when used by an item author

On the server side the component must define 1 method `respond` that takes the model, the answer and some settings.

## Dependencies

A UiComponent or a Library can depend on another Library so long as there are no cyclical dependencies.

Eg - this is invalid:

    A -depends-on-> B
    B -depends-on-> C
    C -depends-on-> A !! Error

If this is detected an error is thrown.

## Folder Structure

## Client

### Render Mode

### Configure Mode

#### register config panel

##### setModel

### Testing

* write your tests in jasmine for the client side and server side
* for the client side you'll need to do a bit more setup depending on the framework you have chosen to use
* run tests using the [test-rig](test-rig)

## Server

### Allowed dependencies

* underscore/lodash

### respond method

    ```javascript
    /**
     * @return an object with the following properties:
     *   - correctness: "correct|incorrect|unknown"
     *   - response: an response object for the client side part of your component - typically contains feedback
     *   - score: a value from 0.0 - 1.0
     */
    response(question, answer, settings)
    ```

### Respond Function

#### Scoring

All components must output a score between 0.0 and 1.0


#### Feedback

### Testing


