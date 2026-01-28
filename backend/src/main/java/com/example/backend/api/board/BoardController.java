package com.example.backend.api.board;

import com.example.backend.api.board.dto.BoardCreateRequest;
import com.example.backend.api.board.dto.BoardCreateResponse;
import com.example.backend.api.board.dto.BoardListResponse;
import com.example.backend.security.principal.CustomUserPrincipal;
import com.example.backend.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.backend.api.board.dto.BoardDetailResponse;
import com.example.backend.api.board.dto.BoardUpdateRequest;
import com.example.backend.api.board.dto.BoardUpdateResponse;


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

    @PostMapping
    public ResponseEntity<BoardCreateResponse> createBoard(@RequestBody BoardCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (!(principalObj instanceof CustomUserPrincipal principal)) {
            return ResponseEntity.status(401).build();
        }

        Long boardId = boardService.createBoard(principal.getUserId(), request);
        return ResponseEntity.ok(BoardCreateResponse.of(boardId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDetailResponse> getBoardDetail(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.getBoardDetail(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardUpdateResponse> updateBoard(
            @PathVariable Long id,
            @RequestBody BoardUpdateRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (!(principalObj instanceof CustomUserPrincipal principal)) {
            return ResponseEntity.status(401).build();
        }

        Long updatedId = boardService.updateBoard(principal.getUserId(), id, request);
        return ResponseEntity.ok(BoardUpdateResponse.of(updatedId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (!(principalObj instanceof CustomUserPrincipal principal)) {
            return ResponseEntity.status(401).build();
        }

        boardService.deleteBoard(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }


}
