// src/hooks/useJobsSearchParams.js

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function useJobsSearchParams() {
  const locationHook = useLocation();
  const navigate = useNavigate();

  const query = useMemo(
    () => new URLSearchParams(locationHook.search),
    [locationHook.search]
  );

  const queryKeyword = query.get("q") || "";
  const queryLocation = query.get("location") || "";
  const querySort = query.get("sort") || "newest";

  const [keyword, setKeyword] = useState(queryKeyword);
  const [location, setLocation] = useState(queryLocation);
  const [sortBy, setSortBy] = useState(querySort);
  const [openSort, setOpenSort] = useState(false);

  useEffect(() => {
    setKeyword(queryKeyword);
    setLocation(queryLocation);
    setSortBy(querySort);
  }, [queryKeyword, queryLocation, querySort]);

  function buildSearchParams(nextKeyword, nextLocation, nextSort) {
    const params = new URLSearchParams();

    if (nextKeyword.trim()) params.set("q", nextKeyword.trim());
    if (nextLocation.trim()) params.set("location", nextLocation.trim());
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);

    return params;
  }

  function buildUrl(params) {
    return `${locationHook.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = buildSearchParams(keyword, location, sortBy);
      const nextUrl = buildUrl(params);

      if (`${locationHook.pathname}${locationHook.search}` !== nextUrl) {
        navigate(nextUrl, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, location, sortBy, locationHook.pathname, locationHook.search]);

  useEffect(() => {
    function handleClickOutside() {
      setOpenSort(false);
    }

    if (openSort) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [openSort]);

  function onSearch(e) {
    e.preventDefault();

    const params = buildSearchParams(keyword, location, sortBy);
    navigate(buildUrl(params));
  }

  function toggleSortDropdown(e) {
    e.stopPropagation();
    setOpenSort((prev) => !prev);
  }

  function changeSort(value) {
    setSortBy(value);
    setOpenSort(false);

    const params = buildSearchParams(keyword, location, value);
    navigate(buildUrl(params));
  }

  return {
    queryKeyword,
    queryLocation,
    querySort,
    keyword,
    setKeyword,
    location,
    setLocation,
    sortBy,
    setSortBy,
    openSort,
    setOpenSort,
    onSearch,
    changeSort,
    toggleSortDropdown,
  };
}