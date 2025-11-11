import { YukigoHaskellParser } from "./index.js"

export const preludeCode = `data Ordering  = LT | EQ | GT
data Maybe a = Nothing | Just a
(,) :: a -> b -> (a, b)
(,) x y = (x, y)
($) :: (a -> b) -> a -> b
($) f x = f x
(.) :: (b -> c) -> (a -> b) -> a -> c
(.) f g a = (\\x -> f (g x)) a
(:) :: a -> [a] -> [a]
(:) x xs = x : xs
(++) :: [a] -> [a] -> [a]
(++) [] ys = ys
(++) (x:xs) ys = x : (xs ++ ys)
(&&) :: (Eq a) => a -> a -> Boolean
(||) :: (Eq a) => a -> a -> Boolean
(&&) x y = x && y
(||) x y = x || y
(==) :: (Ord a) => a -> a -> Boolean
(/=) :: (Ord a) => a -> a -> Boolean
(<) :: (Ord a) => a -> a -> Boolean
(>) :: (Ord a) => a -> a -> Boolean
(<=) :: (Ord a) => a -> a -> Boolean
(>=) :: (Ord a) => a -> a -> Boolean
(==) x y = x == y
(/=) x y = x /= y
(<) x y = x < y
(>) x y = x > y
(<=) x y = x <= y
(>=) x y = x >= y
(+) :: Num a => a -> a -> a
(-) :: Num a => a -> a -> a
(+) x y = x + y
(-) x y = x - y
(**) :: (Floating a) => a -> a -> a
(**) x y = x ** y
(^) :: (Num a, Integral b) => a -> b -> a
(^) x y = x ^ y
(^^) :: (Fractional a, Integral b) => a -> b -> a
(^^) x y = x ^^ y
(*) :: (Num a) => a -> a -> a
(*) x y = x * y
(/) :: Fractional a => a -> a -> a
(/) _ 0 = error "Prelude./: divide by zero"
(/) x y = x / y
(!!) :: [a] -> Int -> a
(!!) xs n | n < 0 = error "Prelude.!!: negative index"
(!!) [] _ = error "Prelude.!!: index too large"
(!!) (x:_) 0 = x
(!!) (_:xs) n = xs !! (n - 1)
not :: Bool -> Bool
not True = False
not False = True
quot :: Integral a => a -> a -> a
quot _ 0 = error "divide by zero"
quot 0 _ = 0
quot a b = let { absA = abs a; absB = abs b; result = quotPositive absA absB } in if (a < 0) == (b < 0) then result else -result
rem :: Integral a => a -> a -> a
rem _ 0 = error "divide by zero"
rem 0 _ = 0
rem a b = let { absA = abs a; absB = abs b; remainder = remPositive absA absB } in if a < 0 then -remainder else remainder
quotPositive :: Integral a => a -> a -> a
quotPositive n d | n < d = 0 | otherwise = 1 + quotPositive (n - d) d
remPositive :: Integral a => a -> a -> a
remPositive n d | n < d = n | otherwise = remPositive (n - d) d
div :: Integral a => a -> a -> a
div _ 0 = error "divide by zero"
div 0 _ = 0
div a b = let { q = quot a b; r = rem a b } in if r == 0 || (a < 0) == (b < 0) then q else q - 1
mod :: Integral a => a -> a -> a
mod _ 0 = error "divide by zero"
mod 0 _ = 0
mod a b = a - (div a b) * b
signum :: (Num a) => a -> a
signum x | x == 0 = 0 | x > 0 = 1 | otherwise = -1
abs :: (Num a) => a -> a
abs n = if n < 0 then -n else n
sqrt :: (Num a) => a -> a
sqrt x = x ** 0.5
max :: a -> a -> a
max x y = if x <= y then y else x
min :: a -> a -> a
min x y = if x <= y then x else y
even :: (Integral a) => a -> Bool
odd :: (Integral a) => a -> Bool
even n = n \`rem\` 2 == 0
odd n = (not . even) n
length :: [a] -> Int
length [] = 0
length (_:l) = 1 + length l
genericLength :: (Integral a) => [b] -> a
genericLength [] = 0
genericLength (x:xs) = 1 + genericLength xs
null :: [a] -> Bool
null [] = True
null (_:_) = False
union :: (Eq a) => [a] -> [a] -> [a]
union xs ys = unionBy (==) xs ys
deleteBy :: (a -> a -> Bool) -> a -> [a] -> [a]
deleteBy eq x [] = []
deleteBy eq x (y:ys) = if x \`eq\` y then ys else y : deleteBy eq x ys
deleteFirstsBy :: (a -> a -> Bool) -> [a] -> [a] -> [a]
deleteFirstsBy eq xs ys = foldl (flip (deleteBy eq)) xs ys
nubBy :: (a -> a -> Bool) -> [a] -> [a]
nubBy eq [] = []
nubBy eq (x:xs) = x : nubBy eq (filter (\\y -> not (eq x y)) xs)
unionBy :: (a -> a -> Bool) -> [a] -> [a] -> [a]
unionBy eq xs ys = xs ++ deleteFirstsBy eq (nubBy eq ys) xs
intersect :: (Eq a) => [a] -> [a] -> [a]
intersect xs ys = intersectBy (==) xs ys
intersectBy :: (a -> a -> Bool) -> [a] -> [a] -> [a]
intersectBy eq xs ys = [x | x <- xs, any (eq x) ys]
elem :: (Eq a) => a -> [a] -> Bool
notElem :: (Eq a) => a -> [a] -> Bool
elem x xs = any (\\y -> y == x) xs
notElem x xs = all (\\y -> y /= x) xs
maximum :: (Ord a) => [a] -> a
minimum :: (Ord a) => [a] -> a
maximum [] = error "Prelude.maximum: empty list"
maximum xs = foldl1 max xs
minimum [] = error "Prelude.minimum: empty list"
minimum xs = foldl1 min xs
sum :: (Num a) => [a] -> a
product :: (Num a) => [a] -> a
sum xs = foldl (+) 0 xs
product xs = foldl (*) 1 xs
concat :: [[a]] -> [a]
concat xss = foldr (++) [] xss
concatMap :: (a -> [b]) -> [a] -> [b]
concatMap f xs = (concat . map) f xs
take :: Int -> [a] -> [a]
take n _ | n <= 0 = []
take _ [] = []
take n (x:xs) = x : take (n - 1) xs
drop :: Int -> [a] -> [a]
drop n xs | n <= 0 = xs
drop _ [] = []
drop n (_:xs) = drop (n - 1) xs
head :: [a] -> a
head (x:_) = x
head [] = error "Prelude.head: empty list"
tail :: [a] -> [a]
tail (_:xs) = xs
tail [] = error "Prelude.tail: empty list"
last :: [a] -> a
last [x] = x
last (_:xs) = last xs
last [] = error "Prelude.last: empty list"
init :: [a] -> [a]
init [x] = []
init (x:xs) = x : init xs
init [] = error "Prelude.init: empty list"
zip :: [a] -> [b] -> [(a, b)]
zip xs ys = zipWith (,) xs ys
zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
zipWith z (a:as) (b:bs) = z a b : zipWith z as bs
zipWith _ _ _ = []
reverse :: [a] -> [a]
reverse xs = foldl (flip (:)) [] xs
filter :: (a -> Bool) -> [a] -> [a]
filter p [] = []
filter p (x:xs) | p x = x : filter p xs | otherwise = filter p xs
map :: (a -> b) -> [a] -> [b]
map f [] = []
map f (x:xs) = f x : map f xs
any :: (a -> Bool) -> [a] -> Bool
all :: (a -> Bool) -> [a] -> Bool
any f (x:xs) = f x || any f xs
all f (x:xs) = f x && all f xs
foldl :: (a -> b -> a) -> a -> [b] -> a
foldl f z [] = z
foldl f z (x:xs) = foldl f (f z x) xs
foldl1 :: (a -> a -> a) -> [a] -> a
foldl1 f (x:xs) = foldl f x xs
foldl1 _ [] = error "Prelude.foldl1: empty list"
foldr :: (a -> b -> b) -> b -> [a] -> b
foldr f z [] = z
foldr f z (x:xs) = f x (foldr f z xs)
foldr1 :: (a -> a -> a) -> [a] -> a
foldr1 f [x] = x
foldr1 f (x:xs) = f x (foldr1 f xs)
foldr1 _ [] = error "Prelude.foldr1: empty list"
find :: Ord a => (a -> Bool) -> [a] -> Maybe a
find _ [] = Nothing
find f (x:xs) | f x = Just x | otherwise = find f xs
sort :: (Ord a) => [a] -> [a]
sort xs = sortBy compare xs
sortBy :: (a -> a -> Ordering) -> [a] -> [a]
sortBy cmp xs = foldr (insertBy cmp) [] xs
compare :: a -> a -> Ordering
compare x y | x == y = EQ | x <= y = LT | otherwise = GT
insertBy :: (a -> a -> Ordering) -> a -> [a] -> [a]
insertBy cmp x [] = [x]
insertBy cmp x ys@(y:ys') = case cmp x y of { GT -> y : insertBy cmp x ys'; _ -> x : ys }
flip :: (a -> b -> c) -> b -> a -> c
flip f x y = f y x
repeat :: a -> [a]
repeat x = x : (repeat x)
iterate :: (a -> a) -> a -> [a]
iterate f x = x : iterate f (f x)
replicate :: Int -> a -> [a]
replicate n x = take n (repeat x)
cycle :: [a] -> [a]
cycle [] = error "Prelude.cycle: empty list"
cycle xs = xs ++ (cycle xs)`