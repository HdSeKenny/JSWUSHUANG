<template>
  <div class="editor" :class="readonly ? 'readonly' : ''">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
      <div class="menubar" v-show="showMenu">
        <div class="toolbar">
          <button class="menubar__button" @click="commands.undo">
            <icon name="undo" />
          </button>
          <button class="menubar__button" @click="commands.redo">
            <icon name="redo" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bold() }"
            @click="commands.bold"
          >
            <icon name="bold" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.italic() }"
            @click="commands.italic"
          >
            <icon name="italic" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.strike() }"
            @click="commands.strike"
          >
            <icon name="strike" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.underline() }"
            @click="commands.underline"
          >
            <icon name="underline" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code() }"
            @click="commands.code"
          >
            <icon name="code" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.paragraph() }"
            @click="commands.paragraph"
          >
            <icon name="paragraph" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 1 }) }"
            @click="commands.heading({ level: 1 })"
          >
            H1
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 2 }) }"
            @click="commands.heading({ level: 2 })"
          >
            H2
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.heading({ level: 3 }) }"
            @click="commands.heading({ level: 3 })"
          >
            H3
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.bullet_list() }"
            @click="commands.bullet_list"
          >
            <icon name="ul" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.ordered_list() }"
            @click="commands.ordered_list"
          >
            <icon name="ol" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.blockquote() }"
            @click="commands.blockquote"
          >
            <icon name="quote" />
          </button>
          <button
            class="menubar__button"
            :class="{ 'is-active': isActive.code_block() }"
            @click="commands.code_block"
          >
            <icon name="code" />
          </button>
          <button
            class="menubar__button"
            @click="commands.createTable({ rowsCount: 3, colsCount: 3, withHeaderRow: false })"
          >
            <icon name="table" />
          </button>
          <span v-if="isActive.table()">
            <button class="menubar__button" @click="commands.deleteTable">
              <icon name="delete_table" />
            </button>
            <button class="menubar__button" @click="commands.addColumnBefore">
              <icon name="add_col_before" />
            </button>
            <button class="menubar__button" @click="commands.addColumnAfter">
              <icon name="add_col_after" />
            </button>
            <button class="menubar__button" @click="commands.deleteColumn">
              <icon name="delete_col" />
            </button>
            <button class="menubar__button" @click="commands.addRowBefore">
              <icon name="add_row_before" />
            </button>
            <button class="menubar__button" @click="commands.addRowAfter">
              <icon name="add_row_after" />
            </button>
            <button class="menubar__button" @click="commands.deleteRow">
              <icon name="delete_row" />
            </button>
            <button class="menubar__button" @click="commands.toggleCellMerge">
              <icon name="combine_cells" />
            </button>
          </span>
        </div>
      </div>
    </editor-menu-bar>

    <editor-content class="editor__content" :editor="editor" />
  </div>
</template>

<script>
import Icon from '@components/icon/index.vue'
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Strike,
  Underline,
  History,
} from 'tiptap-extensions'
export default {
  components: {
    EditorContent,
    EditorMenuBar,
    Icon,
  },
  props: {
    showMenu: {
      type: Boolean,
    },
    readonly: {
      type: Boolean,
    },
    content: {
      type: String,
    },
    onUpdateEditorHtmlStr: {
      type: Function,
    },
  },

  data(props) {
    return {
      editor: new Editor({
        editable: !props.readonly,
        extensions: [
          new Blockquote(),
          new BulletList(),
          new CodeBlock(),
          new HardBreak(),
          new Heading({ levels: [1, 2, 3] }),
          new ListItem(),
          new OrderedList(),
          new TodoItem(),
          new TodoList(),
          new Link(),
          new Bold(),
          new Code(),
          new Italic(),
          new Strike(),
          new Underline(),
          new History(),
          new Table({
            resizable: true,
          }),
          new TableHeader(),
          new TableCell(),
          new TableRow(),
        ],
        content: props.content,
        onUpdate: ({ state, getHTML, getJSON, transaction }) => {
          const htmlStr = getHTML()
          const jsonObj = getJSON()
          const textStrWithNoFormat = jsonObj.content
            .map((joc) => (joc.content ? joc.content[0].text : ''))
            .join(' ')
          props.onUpdateEditorHtmlStr(htmlStr, textStrWithNoFormat)
          // console.log(state, transaction)
          // console.log(getHTML(), getJSON())
        },
        onFocus: ({ event, state, view }) => {
          // TODO
        },
        onBlur: ({ event, state, view }) => {
          // TODO
        },
      }),
    }
  },

  watch: {
    content(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.editor.setContent(newValue)
      }
    },
  },
  beforeDestroy() {
    this.editor.destroy()
  },
}
</script>

<style lang="scss" scoped>
.editor {
  max-width: unset;
  padding: 20px;
  margin: 0;
  border: 2px solid #ebeef5;
  &.readonly {
    padding: 0;
    border: none;
    .editor__content {
      font-size: 15px;
      height: 60px;
      min-height: 0;
      overflow-y: scroll;
    }
  }
  .menubar {
    padding-bottom: 5px;
    border-bottom: 1px solid #ebeef5;
  }
  .editor__content {
    // min-height: 100px;
    ::v-deep .ProseMirror {
      // min-height: 100px;
      p {
        margin: 10px 0;
        &:first-child {
          margin: 0 0 10px 0;
        }
      }
    }
  }
}
</style>
