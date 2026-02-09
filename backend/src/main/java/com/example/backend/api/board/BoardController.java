package com.example.backend.api.board;

import com.example.backend.api.board.dto.BoardCreateRequest;
import com.example.backend.api.board.dto.BoardCreateResponse;
import com.example.backend.api.board.dto.BoardDetailResponse;
import com.example.backend.api.board.dto.BoardListResponse;
import com.example.backend.api.board.dto.BoardUpdateRequest;
import com.example.backend.api.board.dto.BoardUpdateResponse;
import com.example.backend.security.principal.CustomUserPrincipal;
import com.example.backend.service.BoardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/boards")
@Tag(name = "게시판 API", description = "게시글 관련 API")
public class BoardController {

    private final BoardService boardService;

    @Operation(summary = "게시글 목록 조회", description = "게시글 목록을 검색/필터/정렬과 함께 페이지네이션하여 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공")
    })
    @GetMapping
    public ResponseEntity<BoardListResponse> getBoards(
            @Parameter(description = "페이지 번호 (0부터 시작)")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "검색 키워드 (제목/내용 등)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "카테고리 (예: free, review 등)")
            @RequestParam(required = false) String category,
            @Parameter(description = "정렬 기준 (예: latest, popular 등)")
            @RequestParam(required = false) String sort
    ) {
        var pageResult = boardService.getBoardList(page, size, keyword, category, sort);
        return ResponseEntity.ok(BoardListResponse.from(pageResult));
    }

    @Operation(summary = "게시글 작성", description = "게시글을 작성합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "작성 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자")
    })
    @PostMapping
    public ResponseEntity<BoardCreateResponse> createBoard(
            @RequestBody BoardCreateRequest request
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (!(principalObj instanceof CustomUserPrincipal principal)) {
            return ResponseEntity.status(401).build();
        }

        Long boardId = boardService.createBoard(principal.getUserId(), request);
        return ResponseEntity.ok(BoardCreateResponse.of(boardId));
    }

    @Operation(summary = "게시글 상세 조회", description = "특정 게시글의 상세 정보를 조회합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
    })
    @GetMapping("/{id}")
    public ResponseEntity<BoardDetailResponse> getBoardDetail(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(boardService.getBoardDetail(id));
    }

    @Operation(summary = "게시글 수정", description = "특정 게시글의 내용을 수정합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
    })
    @PutMapping("/{id}")
    public ResponseEntity<BoardUpdateResponse> updateBoard(
            @Parameter(description = "게시글 ID", required = true)
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

    @Operation(summary = "게시글 삭제", description = "특정 게시글을 삭제합니다.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "게시글을 찾을 수 없음")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(
            @Parameter(description = "게시글 ID", required = true)
            @PathVariable Long id
    ) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Object principalObj = (authentication == null) ? null : authentication.getPrincipal();

        if (!(principalObj instanceof CustomUserPrincipal principal)) {
            return ResponseEntity.status(401).build();
        }

        boardService.deleteBoard(principal.getUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
