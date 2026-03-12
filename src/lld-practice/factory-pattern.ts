/*
TASK: Design a Document Processing System

Part 1 — Simple Factory

Requirements:
- There is a Document interface with:
    open(): void
    save(): void

- The system supports multiple document types:
    PDFDocument
    WordDocument
    SpreadsheetDocument

- Create a DocumentFactory that returns the correct document
  object based on a string type.

Example usage:

const doc = DocumentFactory.createDocument('pdf');
doc.open();
doc.save();

Constraints:
- Client should not directly instantiate document classes.
- Adding a new document type should only require modifying the factory.


------------------------------------------------------------


Part 2 — GoF Factory Method

Refactor the design to use Factory Method instead of Simple Factory.

Requirements:
- Create an abstract class DocumentCreator.
- It should define a factory method:
    createDocument(): Document

- It should also contain a workflow method such as:
    createAndSaveDocument()

- Subclasses should decide which document type to create:
    PDFDocumentCreator
    WordDocumentCreator
    SpreadsheetDocumentCreator

Example usage:

const creator = new PDFDocumentCreator();
creator.createAndSaveDocument();

Goal:
- The creator class defines the workflow.
- Subclasses decide which concrete document is instantiated.
- Client should not know the concrete document classes.


------------------------------------------------------------


Expected Class Structure (for Factory Method):

Product:
    Document

Concrete Products:
    PDFDocument
    WordDocument
    SpreadsheetDocument

Creator:
    DocumentCreator

Concrete Creators:
    PDFDocumentCreator
    WordDocumentCreator
    SpreadsheetDocumentCreator


------------------------------------------------------------


Optional Extension (Hard Mode):

Add support for:
    HTMLDocument

Ensure minimal code changes are required in both implementations.
*/

/*
Simple Factory

interface Document {
  open(): void;
  save(): void;
}

class PDFDocument implements Document {
  open(): void {
    console.log('Open PDF Document');
  }

  save(): void {
    console.log('Save PDF Document');
  }
}

class WordDocument implements Document {
  open(): void {
    console.log('Open Word Document');
  }

  save(): void {
    console.log('Save Word Document');
  }
}

class SpreadsheetDocument implements Document {
  open(): void {
    console.log('Open Spreadsheet Document');
  }

  save(): void {
    console.log('Save Spreadsheet Document');
  }
}

class DocumentFactory {
  static createDocument(type: string): Document {
    switch (type) {
      case 'pdf':
        return new PDFDocument();
      case 'word':
        return new WordDocument();
      case 'spreadsheet':
        return new SpreadsheetDocument();
      default:
        throw new Error(`Unsupported Document type: ${type}`);
    }
  }
}

const doc = DocumentFactory.createDocument('pdf');
doc.open();
doc.save();
*/

/* Factory Method Pattern Example: Document Processing System
Goal: Decouple object creation from client code and allow subclasses to decide which concrete Document to instantiate. */

interface Document { open(): void; save(): void; }

/* Concrete Products: Implement the Document interface */
class PDFDocument implements Document {
  open(): void { console.log('Open PDF Document'); }
  save(): void { console.log('Save PDF Document'); }
}

class WordDocument implements Document {
  open(): void { console.log('Open Word Document'); }
  save(): void { console.log('Save Word Document'); }
}

class SpreadsheetDocument implements Document {
  open(): void { console.log('Open Spreadsheet Document'); }
  save(): void { console.log('Save Spreadsheet Document'); }
}

/* Creator (Factory Method Owner)
Defines the factory method createDocument() which subclasses must implement.
The public create() method exposes object creation to clients while keeping the factory method protected. */
abstract class DocumentCreator {
  protected abstract createDocument(): Document;
  create(): Document { return this.createDocument(); }
}

/* Concrete Creators: Decide which concrete Document to create */
class PDFDocumentCreator extends DocumentCreator {
  protected createDocument(): Document { return new PDFDocument(); }
}

class WordDocumentCreator extends DocumentCreator {
  protected createDocument(): Document { return new WordDocument(); }
}

class SpreadsheetDocumentCreator extends DocumentCreator {
  protected createDocument(): Document { return new SpreadsheetDocument(); }
}

/* Client Code
Client interacts only with the Creator and the Document interface.
Concrete document classes remain hidden from the client. */
const creator = new PDFDocumentCreator();
const document = creator.create();
document.open();
document.save();