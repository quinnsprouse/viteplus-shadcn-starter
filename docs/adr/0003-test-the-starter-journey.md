# Test a clean copy of the starter

Application tests cannot detect every installation or hook-setup failure. CI copies the Git index into a temporary directory and checks installation, unchanged source files, agent feedback, Git hooks, browser tests, and the production server there. Failed runs preserve the temporary app and diagnostic output for inspection.
