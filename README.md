<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/scorebet/jacoco-coverage-report/workflows/build-test/badge.svg"></a>
</p>



# Jacoco Coverage Report

Generate Jacoco coverage report and comments it to the existing pull request if it exists.

## Usage


### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs
`github_token`
* **Required** Token to use to write to the pull request. `${{secrets.GITHUB_TOKEN}}` will work.

`path`
* **Required** Path to the test results in xml format generated through [jacoco report](https://www.eclemma.org/jacoco/trunk/doc/report-mojo.html).

`coverage_path` 
* **Required** Path to the coverage file that contains the previous coverage results. If file is missing, it will create that file and write the coverage result.

`decrease_threshold`
* Threshold for acceptable coverage. If coverage fells below (`previous-coverage` - `decrease-coverage`), it wont fail this step but generates an output saying that the coverage failed.

`coveralls_url`
* The coveralls url which is displayed as part of the report within the pull request.

### Outputs

`report-coverage-status`
* Status of the coverage report:
  - `success` Passed coverage result either the same/more coverage added. 
  - `failure` Failed coverage result due to decreased coverage.

`report-coverage-summary`
* Summary of the coverage report which contains how much coverage added or loss.

### Example workflow

```yaml
name: Jacoco Test Result

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Create Jacoco coverage check
        id: jacoco-coverage-report
        uses: ./
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          path: ./test/jacocoTestReport.xml
          coverage_path: ./fixtures/coverage-report.cov
          decrease_threshold: 0.075
      - name: Check Jacoco coverage outputs
        env:
          REPORT_COVERAGE_STATUS: ${{ steps.jacoco-coverage-report-failure.outputs.report-coverage-status }}
          REPORT_COVERAGE_SUMMARY: ${{ steps.jacoco-coverage-report-failure.outputs.report-coverage-summary }}
        run: |
          echo $REPORT_COVERAGE_STATUS
          echo $REPORT_COVERAGE_SUMMARY
```

### Example comment in pull request
```diff d3f06eff-da11-4bab-9164-8393ac271c50
@@                    Coverage                   @@
===================================================
##              dev         #2013       +/-      ##
===================================================
+ LINE          97.773%     97.775%     +0.0017%


@@                 Coverage Summary              @@
===================================================
##              dev         #2013       +/-      ##
===================================================
- BRANCH        74.911%     74.889%     -0.0223%
+ CLASS         96.828%     96.829%     +0.0018%
+ COMPLEXITY    73.748%     73.765%     +0.0178%
- INSTRUCTION   93.664%     93.657%     -0.0062%
+ LINE          97.773%     97.775%     +0.0017%
+ METHOD        94.042%     94.045%     +0.0030%
```

For coveralls report: https://coveralls.io

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
