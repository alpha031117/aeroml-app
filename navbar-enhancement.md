Act as a Senior UX/UI Engineer specializing in Next.js and Tailwind CSS.

I need to upgrade the top Navigation Bar component for "AeroML," my dark-themed AutoML platform. Currently, it only contains a logo and a user profile. I need to make it more functional and visually distinct while preserving the minimalist, pure black aesthetic.

**Tech Stack:**
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide-React (or Heroicons)

**Requirements for the New Navbar:**
1.  **Container Styling:**
    - Use a fixed position at the top (`sticky` or `fixed`).
    - Give it a subtle distinction from the background: pure black (`bg-black`) with a very faint bottom border (`border-b border-white/10`) OR a subtle glassmorphism effect (`bg-black/80 backdrop-blur-md`).

2.  **Left Section (Branding):**
    - Keep the "AeroML" logo text (White, Sans-serif, Bold).
    - Add a small, abstract logo icon next to the text if possible.

3.  **Middle Section (New Navigation Links):**
    - Add a centered row of navigation links: "Dashboard", "Datasets", "Models", and "Documentation".
    - **State Styling:** - Inactive links: Light Grey (`text-gray-400`).
        - Hover state: White (`text-white`) with a subtle transition.
        - Active state: White with a small glowing dot or underline.

4.  **Right Section (User Actions):**
    - **Notification Icon:** Add a generic bell icon to the left of the profile avatar.
    - **Profile Dropdown:** Keep the circular "U" avatar. Ensure the dropdown menu (which contains Model History, Sign Out) matches the dark theme (Dark grey background `bg-zinc-900`, thin borders, white text).

**Output:**
Please write the full `Navbar.tsx` component code. Use standard HTML `<nav>` and `<ul>` tags for accessibility. Ensure the layout is responsive (hide middle links on mobile and show a hamburger menu icon instead).