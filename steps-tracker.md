Act as a Senior Frontend Developer specializing in Next.js and Tailwind CSS.

I am building "AeroML," a dark-themed AutoML platform using Next.js. I have a current design for the "Model Selection" screen, but it lacks user orientation. I need you to create a "Dynamic Progress Stepper" component.

**Context & Tech Stack:**
- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS.
- **Theme:** Dark Mode (Background #000000, Text White).
- **Current UI:** Minimalist, centered input field with suggestions below.

**The Requirement:**
Create a reusable React component named `ProgressStepper.tsx` that I can import into my page.

**Specific Features Needed:**
1. **The Steps:** Define the stages as an array of objects:
   - 1. Data Upload (Completed)
   - 2. Model Selection (Current/Active)
   - 3. Configuration
   - 4. Training
   - 5. Evaluation
2. **Visual Logic:**
   - **Completed:** Show a checkmark icon (use Lucide-React or Heroicons), text dim grey.
   - **Active:** Highlighted text (White or Blue-500), perhaps a glowing border or dot indicator.
   - **Pending:** Dark grey text.
3. **Layout:**
   - Create a vertical sidebar layout that sits on the left side of the screen, leaving the center open for the existing input form.
4. **Code Requirements:**
   - **Must include `'use client'`** at the top since this is an interactive component.
   - Use Tailwind classes for all styling (no external CSS files).
   - Ensure the component accepts a `currentStep` prop so I can control it dynamically.

Please provide the full code for `ProgressStepper.tsx` and a brief example of how to place it in a `page.tsx` layout next to the main content.