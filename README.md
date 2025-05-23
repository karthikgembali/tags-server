CREATE TABLE tags(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tag_name VARCHAR(250) NOT NULL,
    tag_code VARCHAR(250) NOT NULL,
    created_on DATE NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
ALTER TABLE `tags` ADD `tag_value` VARCHAR(250) NULL AFTER `tag_code`;
ALTER TABLE `tags` ADD UNIQUE(`tag_code`);

Give me an angular application using angular version 18 that contains three steps in first step there will be 2 input fields in which 1st input field is to give tag name and based on 1st input value 2nd input field tag code got patch which is in disabled state by default and the process of patching is if user enters tag name like merit plan 123 the value to be patched to tag code is merit_plan_123. this part should be in upper part of the step and in the lower part of the step must contain a table of column tag names and tag code to show the already added tags in the database , also there should be step denotion on the top and next button on bottom . Now in the 2nd step you will get those tag names and tag codes as a columns in a table and 3rd column will be the  value that you need to give it to the tag that means you should have input field on the 3rd column here you should put a submit buton to store the tag values also you should put proceed button there to move to 3rd step. Here you should give a upload option to upload the docs document with the tag codes present in the document and this document will be processed  in the back end and thereby replacing those tag code with the values given in the 2nd step . After the process is done you should put preview option to preview the uploaded file and download . seperate each process in each component
