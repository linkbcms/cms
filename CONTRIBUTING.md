# Contributing

Thanks for your interest in contributing to linkbcms.com. We're happy to have you here.

Please take a moment to review this document before submitting your first pull request. We also strongly recommend that you check for open issues and pull requests to see if someone else is working on something similar.

If you need any help, feel free to reach out to [@linkb15](https://x.com/linkb150).

## About this repository

This repository is a monorepo.

- We use [pnpm](https://pnpm.io) and [`workspaces`](https://pnpm.io/workspaces) for development.
- We use [Turborepo](https://turbo.build/repo) as our build system.
- We use [changesets](https://github.com/changesets/changesets) for managing releases.

## Structure

This repository is structured as follows:

```bash
apps
└── web
└── docs
packages
└── core
└── linkb
└── ui
templates

```

| Path                  | Description                              |
| --------------------- | ---------------------------------------- |
| `apps/web`        | The Next.js application for internal testing. |
| `apps/docs` | The Documentation website for the website based on [`fumadocs`](https://github.com/fuma-nama/fumadocs).    |
| `packages/core`    | The core package for the website.             |
| `packages/linkb`   | The cli `@linkbcms/cli` for the generating schema and migrations.         |
| `packages/ui`        | The `@linkbcms/ui` package.                 |
| `templates`        | The templates for the website.                 |

## Development

### Fork this repo

You can fork this repo by clicking the fork button in the top right corner of this page.

### Clone on your local machine

```bash
git clone https://github.com/your-username/cms.git
```

### Navigate to project directory

```bash
cd cms
```

### Create a new Branch

```bash
git checkout -b my-new-branch
```

### Install dependencies

```bash
pnpm install
```

### Run a workspace

You can use the `pnpm --filter=[WORKSPACE]` command to start the development process for a workspace.

#### Examples

1. To run the `web` website:

    ```bash
    pnpm --filter=web dev
    ```

2. To run the `@linkbcms/core` package:

    ```bash
    pnpm --filter=@linkbcms/core dev
    ```

## Running the CLI Locally

To run the CLI locally, you can follow the workflow:

1. Start by running the core package to make sure the core is up to date and types are generated:

   ```bash
   pnpm --filter=@linkbcms/core dev
   ```

2. Run the development script for the CLI:

   ```bash
   pnpm --filter=@linkbcms/cli dev
   ```

3. In another terminal tab, test the CLI by running:

   ```bash
   pnpm --filter=@linkbcms/cli linkb --help
   ```

This workflow ensures that you are running the most recent version of the core and testing the CLI properly in your local environment.

## Documentation

The documentation for this project is located in the `docs` workspace. You can run the documentation locally by running the following command:

```bash
pnpm --filter=docs dev
```

Documentation is written using [MDX](https://mdxjs.com) and built using [fumadocs](https://github.com/fuma-nama/fumadocs). You can find the documentation files in the `apps/docs/content/docs` directory.

## Commit Convention

Before you create a Pull Request, please check whether your commits comply with
the commit conventions used in this repository.

When you create a commit we kindly ask you to follow the convention
`category(scope or module): message` in your commit message while using one of
the following categories:

- `feat / feature`: all changes that introduce completely new code or new
  features
- `fix`: changes that fix a bug (ideally you will additionally reference an
  issue if present)
- `refactor`: any code related change that is not a fix nor a feature
- `docs`: changing existing or creating new documentation (i.e. README, docs for
  usage of a lib or cli usage)
- `build`: all changes regarding the build of the software, changes to
  dependencies or the addition of new dependencies
- `test`: all changes regarding tests (adding new tests or changing existing
  ones)
- `ci`: all changes regarding the configuration of continuous integration (i.e.
  github actions, ci system)
- `chore`: all changes to the repository that do not fit into any of the above
  categories

  e.g. `feat(components): add new prop to the avatar component`

If you are interested in the detailed specification you can visit
<https://www.conventionalcommits.org/> or check out the
[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.
