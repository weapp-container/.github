import test from 'node:test';
import assert from 'node:assert/strict';
import {codeBlocks} from './check-content.mjs';

test('examples preserve language, comments, field names and executable bytes', () => {
  assert.deepEqual(codeBlocks('# Heading\n\n```js\nwx.nextTick(() => {}); // 中文示例\n```\n'), [{language: 'js', code: 'wx.nextTick(() => {}); // 中文示例\n'}]);
  assert.notDeepEqual(codeBlocks('```json\n{"enabled":false}\n```'), codeBlocks('```json\n{"enabled":true}\n```'));
});
