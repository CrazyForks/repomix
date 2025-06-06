# Định dạng đầu ra

Repomix hỗ trợ nhiều định dạng đầu ra khác nhau để đáp ứng các nhu cầu khác nhau. Mỗi định dạng có ưu điểm riêng và phù hợp với các trường hợp sử dụng khác nhau.

## Định dạng có sẵn

Repomix hỗ trợ ba định dạng đầu ra chính:

1. **XML** (mặc định)
2. **Markdown**
3. **Văn bản thuần túy**

Bạn có thể chỉ định định dạng đầu ra bằng cách sử dụng tùy chọn `--style`:

```bash
# XML (mặc định)
repomix --style xml

# Markdown
repomix --style markdown

# Văn bản thuần túy
repomix --style plain
```

## Định dạng XML

Định dạng XML là định dạng mặc định và được khuyến nghị cho hầu hết các trường hợp sử dụng. Nó cung cấp cấu trúc rõ ràng và dễ dàng cho AI phân tích.

Ví dụ về đầu ra XML:

```xml
<repository name="repomix" path="/path/to/repomix">
  <stats>
    <file_count>42</file_count>
    <total_lines>1234</total_lines>
    <total_tokens>5678</total_tokens>
  </stats>
  <top_files>
    <file path="src/index.ts" lines="100" tokens="450" />
    <file path="src/utils.ts" lines="80" tokens="320" />
    <!-- ... -->
  </top_files>
  <files>
    <file path="src/index.ts" language="typescript">
      import { processRepository } from './core';
      // Nội dung tệp...
    </file>
    <file path="src/utils.ts" language="typescript">
      export function formatOutput(data) {
        // Nội dung tệp...
      }
    </file>
    <!-- ... -->
  </files>
</repository>
```

Định dạng XML đặc biệt hữu ích cho:
- Cung cấp cấu trúc rõ ràng cho AI
- Bao gồm siêu dữ liệu về mỗi tệp (ngôn ngữ, số dòng, số token)
- Phân tích tự động bởi các công cụ

## Định dạng Markdown

Định dạng Markdown cung cấp đầu ra dễ đọc hơn cho con người, đồng thời vẫn duy trì cấu trúc đủ tốt cho AI.

Ví dụ về đầu ra Markdown:

```markdown
# Repository: repomix

## Stats
- File count: 42
- Total lines: 1234
- Total tokens: 5678

## Top Files
1. src/index.ts (100 lines, 450 tokens)
2. src/utils.ts (80 lines, 320 tokens)
...

## Files

### src/index.ts (typescript)
```typescript
import { processRepository } from './core';
// Nội dung tệp...
```

### src/utils.ts (typescript)
```typescript
export function formatOutput(data) {
  // Nội dung tệp...
}
```
...
```

Định dạng Markdown đặc biệt hữu ích cho:
- Đọc và xem xét bởi con người
- Chia sẻ codebase trong các tài liệu hoặc wiki
- Sử dụng với các công cụ hỗ trợ Markdown

## Định dạng văn bản thuần túy

Định dạng văn bản thuần túy cung cấp đầu ra đơn giản nhất, không có định dạng đặc biệt.

Ví dụ về đầu ra văn bản thuần túy:

```
Repository: repomix

Stats:
File count: 42
Total lines: 1234
Total tokens: 5678

Top Files:
1. src/index.ts (100 lines, 450 tokens)
2. src/utils.ts (80 lines, 320 tokens)
...

Files:

File: src/index.ts (typescript)
import { processRepository } from './core';
// Nội dung tệp...

File: src/utils.ts (typescript)
export function formatOutput(data) {
  // Nội dung tệp...
}
...
```

Định dạng văn bản thuần túy đặc biệt hữu ích cho:
- Tương thích tối đa với các công cụ khác nhau
- Trường hợp khi định dạng không quan trọng
- Sử dụng với các công cụ AI cũ hơn có thể gặp khó khăn với XML hoặc Markdown

## Tùy chọn định dạng bổ sung

Ngoài việc chọn định dạng đầu ra, Repomix cũng cung cấp các tùy chọn bổ sung để tùy chỉnh đầu ra:

### Xóa bình luận

Để xóa bình luận khỏi mã nguồn trong đầu ra:

```bash
repomix --remove-comments
```

Điều này có thể hữu ích để giảm kích thước đầu ra và tập trung vào mã thực tế.

### Hiển thị số dòng

Để bao gồm số dòng trong đầu ra:

```bash
repomix --show-line-numbers
```

Điều này giúp dễ dàng tham khảo các dòng cụ thể khi thảo luận về mã với AI.

### Số lượng tệp hàng đầu

Để chỉ định số lượng tệp hàng đầu để hiển thị trong tóm tắt:

```bash
repomix --top-files-length 20
```

Mặc định là 10 tệp.

## Tên tệp đầu ra tùy chỉnh

Để chỉ định tên tệp đầu ra:

```bash
repomix --output-file my-codebase.xml
```

Mặc định, Repomix sẽ tạo:
- `repomix-output.xml` cho định dạng XML
- `repomix-output.md` cho định dạng Markdown
- `repomix-output.txt` cho định dạng văn bản thuần túy

## Tiếp theo là gì?

- [Tùy chọn dòng lệnh](command-line-options.md): Xem tất cả các tùy chọn dòng lệnh có sẵn
- [Cấu hình](configuration.md): Tìm hiểu về tệp cấu hình
- [Xóa bình luận](comment-removal.md): Tìm hiểu thêm về tính năng xóa bình luận
