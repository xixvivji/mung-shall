package com.example.backend.api.board;

import com.example.backend.api.board.dto.BoardListResponse;
import com.example.backend.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<BoardListResponse> getBoards(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category
    ) {
        var pageResult = boardService.getBoardList(page, size, keyword, category);
        return ResponseEntity.ok(BoardListResponse.from(pageResult));
    }
}
