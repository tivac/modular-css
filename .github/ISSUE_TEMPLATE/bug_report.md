name: "\U0001F41E Bug report"
description: Something went awry and you'd like to tell us about it.
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: textarea
    id: bug-description
    attributes:
      label: Describe the bug
      description: A clear and concise description of what the bug is. If you intend to submit a PR for this issue, tell us in the description. Thanks!
      placeholder: Bug description
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Reproduction
      description: Please provide a link to a repo or REPL that can reproduce the problem you ran into. Issues without a repro will not be fixed.
      placeholder: Reproduction
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Logs
      description: Any and all logs you think might be useful or relevant, as text only please. Running with `--verbose` should generate quite a bit of output.
      render: shell
  - type: textarea
    id: system-info
    attributes:
      label: System Info
      description: Output of `npx envinfo --system --npmPackages @modular-css/* --binaries --markdown`
      render: shell
      placeholder: System, Binaries, Packages
    validations:
      required: true
  - type: dropdown
    id: severity
    attributes:
      label: Severity
      description: Select the severity of this issue
      options:
        - annoyance
        - blocking an upgrade
        - blocking all usage of `modular-css`
    validations:
      required: true
