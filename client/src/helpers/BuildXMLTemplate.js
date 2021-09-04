const BuildXMLTemplate = (template) => {
  return [
    // One way to fix the indent issue with template sting, whatever...
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!-- Reason why xsi was added: https://jamiephan.github.io/HeroesOfTheStorm_TryMode2.0/modding.html#mod-xml -->`,
    `<Catalog xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/jamiephan/HeroesOfTheStorm_Gamedata/master/xsd/latest.xsd">`,
    template.author ? `  <!-- Special Thanks to ${template.author} for providing this example: ${template.name} -->` : `  <!-- Example: ${template.name} -->`,
    ``,
    ...Array.isArray(template.content) ? template.content.map(x => `  ${x}`) : template.content.split("\n").map(x => `  ${x}`),
    `</Catalog>`
  ].join("\n")
}

export default BuildXMLTemplate