# Readme Stats Action

[GitHub Readme Stats](https://github.com/anuraghazra/github-readme-stats), but in text format.

## Usage

### Workflow

```yaml
- uses: canoypa/readme-stats-action
  with:
    # GitHub Token.
    # A Personal Access Token is required to include private repository data.
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

    # Number of languages to display in Most Used Languages
    # Default: "5"
    most-used-languages-count: "5"
```

### Readme

Add start/end comment markers where you want to display stats.

The content between markers is replaced with the latest stats on each run.

To avoid overwriting your original file, save it as a separate template file and use the `template` option.

#### Contributions

Show detailed GitHub Contribution.

```markdown
<!-- readme-stats:contributions:start -->
<!-- readme-stats:contributions:end -->
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
<!-- readme-stats:most-used-languages:start -->
<!-- readme-stats:most-used-languages:end -->
```

Display like:

```
TypeScript 32.28% | ████████████████████
JavaScript 28.45% | ██████████████████
SCSS        9.30% | ██████
HTML        4.18% | ███
CSS         3.23% | ██
```
