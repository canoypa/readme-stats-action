# Readme Stats Action

[GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats), but in text format.

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

    # Target markdown file path
    # Default: "README.md"
    target: "README.md"

    # Path of the file to be copied to the "target" path
    template: "README_TEMPLATE.md"
```

### Readme

Add comments where you want to display.

Comments are replaced with the text of the stats.

So, save the original markdown file as a separate file.
In this action, you can use the "template" option.

#### Contributions

Show detailed GitHub Contribution.

```markdown
<!-- readme-stats:contributions -->
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
<!-- readme-stats:most-used-languages -->
```

Display like:

```
TypeScript 32.28% | ████████████████████
JavaScript 28.45% | ██████████████████
SCSS        9.30% | ██████
HTML        4.18% | ███
CSS         3.23% | ██
```
