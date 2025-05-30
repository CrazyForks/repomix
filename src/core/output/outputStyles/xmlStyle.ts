export const getXmlTemplate = () => {
  return /* xml */ `
{{#if fileSummaryEnabled}}
{{{generationHeader}}}

<file_summary>
This section contains a summary of this file.

<purpose>
{{{summaryPurpose}}}
</purpose>

<file_format>
{{{summaryFileFormat}}}
5. Multiple file entries, each consisting of:
  - File path as an attribute
  - Full contents of the file
</file_format>

<usage_guidelines>
{{{summaryUsageGuidelines}}}
</usage_guidelines>

<notes>
{{{summaryNotes}}}
</notes>

</file_summary>

{{/if}}
{{#if headerText}}
<user_provided_header>
{{{headerText}}}
</user_provided_header>

{{/if}}
{{#if directoryStructureEnabled}}
<directory_structure>
{{{treeString}}}
</directory_structure>

{{/if}}
{{#if filesEnabled}}
<files>
This section contains the contents of the repository's files.

{{#each processedFiles}}
<file path="{{{this.path}}}">
{{{this.content}}}
</file>

{{/each}}
</files>
{{/if}}

{{#if gitDiffEnabled}}
<git_diffs>
<git_diff_work_tree>
{{{gitDiffWorkTree}}}
</git_diff_work_tree>
<git_diff_staged>
{{{gitDiffStaged}}}
</git_diff_staged>
</git_diffs>
{{/if}}

{{#if instruction}}
<instruction>
{{{instruction}}}
</instruction>
{{/if}}
`;
};
