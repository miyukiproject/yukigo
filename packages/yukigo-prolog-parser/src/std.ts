export const stdCode = `
% between(+Low, +High, ?Value)
% True if Low =< Value =< High (assuming integers)
between(Low, High, Low) :- Low =< High.
between(Low, High, Value) :-
    Low < High,
    NextLow is Low + 1,
    between(NextLow, High, Value).

% union(+List1, +List2, -Union)
% Union of two lists without duplicates (order not preserved)
union([], L, L).
union([H|T], L2, Union) :-
    (   member(H, L2)
    ->  union(T, L2, Union)
    ;   Union = [H|Rest],
        union(T, L2, Rest)
    ).

% intersection(+List1, +List2, -Intersection)
intersection([], _, []).
intersection([H|T], L2, [H|Rest]) :-
    member(H, L2),
    !,
    intersection(T, L2, Rest).
intersection([_|T], L2, Rest) :-
    intersection(T, L2, Rest).

% max_member(-Max, +List)
max_member(Max, [Max]) :- !.
max_member(Max, [H|T]) :-
    max_member(M, T),
    (   H > M
    ->  Max = H
    ;   Max = M
    ).

% min_member(-Min, +List)
min_member(Min, [Min]) :- !.
min_member(Min, [H|T]) :-
    min_member(M, T),
    (   H < M
    ->  Min = H
    ;   Min = M
    ).

% sumlist(+List, -Sum)
sumlist([], 0).
sumlist([H|T], Sum) :-
    sumlist(T, RestSum),
    Sum is H + RestSum.

% length(?List, ?Length)
length([], 0).
length([_|Tail], N) :-
    length(Tail, M),
    N is M + 1.

% flatten(+NestedList, -FlatList)
flatten([], []).
flatten([H|T], Flat) :-
    !,
    flatten(H, FlatH),
    flatten(T, FlatT),
    append(FlatH, FlatT, Flat).
flatten(X, [X]).

% reverse(+List, -Reversed)
reverse(List, Reversed) :-
    reverse_acc(List, [], Reversed).

reverse_acc([], Acc, Acc).
reverse_acc([H|T], Acc, Reversed) :-
    reverse_acc(T, [H|Acc], Reversed).

% list_to_set(+List, -Set)
% Removes duplicates, keeps first occurrence
list_to_set([], []).
list_to_set([H|T], [H|Rest]) :-
    exclude(==(H), T, T1),
    list_to_set(T1, Rest).

==(H, T) :-
    H == T.

% nth0(?Index, ?List, ?Elem)
% Index starts at 0
nth0(0, [H|_], H).
nth0(N, [_|T], Elem) :-
    N > 0,
    N1 is N - 1,
    nth0(N1, T, Elem).

% nth1(?Index, ?List, ?Elem)
% Index starts at 1
nth1(1, [H|_], H).
nth1(N, [_|T], Elem) :-
    N > 1,
    N1 is N - 1,
    nth1(N1, T, Elem).

% append/3 (needed for flatten and union)
append([], L, L).
append([H|T], L, [H|R]) :-
    append(T, L, R).

% member/2 (needed for many predicates)
member(H, [H|_]).
member(H, [_|T]) :-
    member(H, T).

% exclude(+Pred, +List, -Filtered)
% Removes elements satisfying Pred
exclude(_, [], []).
exclude(Pred, [H|T], Rest) :-
    (   call(Pred, H)
    ->  exclude(Pred, T, Rest)
    ;   Rest = [H|Rest2],
        exclude(Pred, T, Rest2)
    ).
`