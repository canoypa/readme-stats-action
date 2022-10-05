# Readme Stats Action

Action for adding text-based GitHub stats to README.

## Usage

### Workflow

```yaml
- uses: canoypa/readme-stats-action
  with:
    # Personal access token
    # If you want to show private activities, required user and repo permissions.
    # Default: ${{ github.token }}
    token: ""

    # User name
    # Default: ${{ github.repository_owner }}
    user-name: ""
```

### Readme

Add comments where you want to display.

#### Contributions

Show detailed GitHub Contribution.

```markdown
<!-- contributions start -->
<!-- contributions end -->
```

Display like:

```
Repositories         : 50
Issues               : 32
Commits              : 328
Pull-Requests        : 105
Total Stars Earned   : 12
Total Contributed To : 4
```

#### Most Used Languages

Show the most used languages.

```markdown
<!-- most-used-languages start -->
<!-- most-used-languages end -->
```

Display like:

```
TypeScript 32.28% | ████████████████████
JavaScript 28.45% | ██████████████████
SCSS        9.30% | ██████
HTML        4.18% | ███
CSS         3.23% | ██
```
