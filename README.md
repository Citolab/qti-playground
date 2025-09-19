# qti-playground

qti-playground is an open-source application that enables users to test, play, and upgrade QTI packages directly in the browser. Built with Vite, React, and Tailwind CSS, it leverages @citolab/qti-components and @citolab/qti-convert to provide a seamless client-side experience without the need for a backend.

### Features

- QTI Package Rendering: Utilize @citolab/qti-components to render 1EdTech QTI items within your application.
- QTI Package Conversion: Convert QTI 2.x packages to QTI 3.0 using @citolab/qti-convert, facilitating modernization of assessment content.
- Modern Frontend Stack: Developed with Vite for fast builds, React for component-based UI, and Tailwind CSS for utility-first styling.

### Getting Started

To set up and run qti-playground locally, follow these steps:

Installation

1. Clone the Repository:

```bash
git clone https://github.com/your-username/qti-playground.git
```

2. Navigate to the Project Directory:

```bash
cd qti-playground
```

3. Install Dependencies:

```bash
npm install
```

#### Running the Application

Start the development server with:

```bash
npm run dev
```

The application will be available at http://localhost:portnumber

### Usage

Upon launching the application, you can:

- Load QTI Packages: Upload QTI packages to render and interact with assessment items.
- Convert QTI Packages: Use the built-in conversion tools to upgrade QTI 2.x packages to QTI 3.0.
- Customize Assessments: Modify and test assessment items in real-time within the browser.

### Technologies Used

- **Vite**: Next-generation frontend tooling for fast and efficient - development.
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- [@citolab/qti-components](https://github.com/citolab/qti-convert): Our own web component library for rendering 1EdTech QTI items.
- [@citolab/qti-convert](https://github.com/citolab/qti-components): A tool for converting and transforming QTI packages.

### Contributing

Contributions are welcome! To contribute:

1. **Fork the Repository**: Click the ‘Fork’ button at the top right of the repository page on GitHub.
2. **Clone Your Fork**: Clone your forked repository to your local machine.
3. **Create a Branch**: Create a new branch for your feature or bug fix.
4. **Make Changes**: Implement your changes and commit them with clear messages.
5. **Push to GitHub**: Push your changes to your forked repository.
6. **Submit a Pull Request**: Open a pull request to merge your changes into the main repository.

Please ensure your contributions adhere to the project’s coding standards and convention

### Third-Party Components

This project includes [Saxon-JS](https://www.saxonica.com/saxon-js/), © Saxonica Ltd. All rights reserved. Saxon-JS is licensed under specific terms; see [Saxon-JS-License.txt](Saxon-JS-License.txt) for details.

This project uses [MathJax](https://www.mathjax.org/), which is licensed under the Apache License 2.0. See the LICENSE file in the MathJax directory for details.
