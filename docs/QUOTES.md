### **Table of Contents**

- [Forking TypeUZ](#forking-typeuz)
- [Creating Quotes](#creating-quotes)
- [Committing Quotes](#committing-quotes)
- [Quote Guidelines](#quote-guidelines)

### Forking TypeUZ

First you will have to copy the TypeUZ repository also known as forking. Go to the [TypeUZ Repo](https://github.com/typeuz/typeuz/) and then click the "fork" button.

<img width="1552" alt="Screen Shot 2022-01-12 at 11 51 49 AM" src="https://user-images.githubusercontent.com/83455454/149194972-23343642-7a1f-4c0c-b5f2-36f4b39a2639.png">

## Creating Quotes

After you forked the TypeUZ repository you can now add your quotes. (If you haven't already forked the repository, refer to this [section](#forking-typeuz).) (Before continuing to the next step make sure the quote's language exists in TypeUZ) Add this code in at the end of the quotes `./frontend/static/quotes/[language].json`:

```json
{
    "text": "[quote]",
    "source": "[source]",
    "id": [number of the quote],
    "length": [number of characters in quote]
}
```

If the language does exist in TypeUZ, but there are no quotes for it create a new file for the language.

### Committing Quotes

Once you have added your quote(s), you now need to create a pull request to the main TypeUZ repository. Go to the branch where you added your quotes on GitHub. Then make sure your branch is up to date. Once it is up to date, click "contribute".

Update branch:
<img width="1552" alt="Screenshot showing how to update the fork to match the main TypeUZ repository" src="https://user-images.githubusercontent.com/83455454/149186547-5b9fe4fd-b944-4eed-a959-db43f96198bf.png">

Create a pull request:
<img width="1552" alt="Screenshot showing how to create a pull request to the main TypeUZ repository" src="https://user-images.githubusercontent.com/83455454/149186637-66dae488-05ae-45c4-9217-65bc36c4927b.png">

## Quote Guidelines

Make sure your quote(s) follows the [Quote guidelines](./CONTRIBUTING.md#quote-guidelines).
