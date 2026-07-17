import { PersonalBest, PersonalBests } from "@monkeytype/schemas/shared";
import {
  RankAndCount,
  UserProfile as UserProfileType,
} from "@monkeytype/schemas/users";
import { formatDate } from "date-fns/format";
import {
  createMemo,
  createResource,
  For,
  JSXElement,
  Show,
} from "solid-js";

import * as PbTablesModal from "../../../modals/pb-tables";
import { getFormatting, isAuthenticated } from "../../../states/core";
import { formatTopPercentage } from "../../../utils/misc";
import Ape from "../../../ape";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";
import { ActivityCalendar } from "./ActivityCalendar";
import { UserDetails } from "./UserDetails";

function WeeklyAnalysis(): JSXElement {
  const [analysis] = createResource(
    () => (isAuthenticated() ? "fetch" : null),
    async () => {
      const res = await Ape.users.getWeeklyAnalysis();
      if (res.status !== 200) return null;
      return res.body.data;
    },
  );

  return (
    <div class="rounded bg-sub-alt p-4">
      <Show when={!analysis.loading && analysis() === null}>
        <span class="text-sm text-sub">
          Tahlil uchun profilingizga kiring yoki ko&apos;proq test topshiring.
        </span>
      </Show>
      <Show when={analysis.loading}>
        <div class="flex flex-col gap-3">
          <div class="h-4 w-32 animate-pulse rounded bg-text/10"></div>
          <div class="h-3 w-64 animate-pulse rounded bg-text/10"></div>
          <div class="h-3 w-48 animate-pulse rounded bg-text/10"></div>
        </div>
      </Show>
      <Show when={analysis() !== undefined && analysis() !== null}>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <Fa icon="fa-brain" class="text-base text-main" />
            <span class="text-sm font-semibold text-text">
              Haftalik AI tahlil
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div>
              <span class="text-sub">O&apos;rtacha WPM</span>
              <div class="text-lg font-bold text-text">
                {analysis()?.avgWpm.toFixed(1)}
              </div>
            </div>
            <div>
              <span class="text-sub">O&apos;rtacha aniqlik</span>
              <div class="text-lg font-bold text-text">
                {analysis()?.avgAccuracy.toFixed(1)}%
              </div>
            </div>
            <div>
              <span class="text-sub">Jami testlar</span>
              <div class="text-lg font-bold text-text">
                {analysis()?.totalTests}
              </div>
            </div>
            <div>
              <span class="text-sub">Eng yaxshi WPM</span>
              <div class="text-lg font-bold text-text">
                {analysis()?.bestWpm}
              </div>
            </div>
          </div>
          <div class="flex flex-wrap gap-4 text-xs">
            <Show when={analysis()?.trend === "improving"}>
              <div class="flex items-center gap-1 text-green-400">
                <Fa icon="fa-arrow-up" class="text-xs" /> O&apos;sish
              </div>
            </Show>
            <Show when={analysis()?.trend === "declining"}>
              <div class="flex items-center gap-1 text-red-400">
                <Fa icon="fa-arrow-down" class="text-xs" /> Pasayish
              </div>
            </Show>
            <Show when={analysis()?.trend === "stable"}>
              <div class="flex items-center gap-1 text-sub">
                <Fa icon="fa-minus" class="text-xs" /> Barqaror
              </div>
            </Show>
            <Show when={analysis()?.bestDay}>
              <div class="text-sub">
                Eng yaxshi kun: {analysis()?.bestDay}
              </div>
            </Show>
          </div>
          <Show when={(analysis()?.dailyBreakdown.length ?? 0) > 0}>
            <div class="flex items-end gap-1">
              <For each={analysis()?.dailyBreakdown ?? []}>
                {(day) => (
                  <div class="flex flex-1 flex-col items-center gap-1">
                    <div
                      class="w-full rounded bg-main"
                      style={{
                        height: `${Math.max(
                          4,
                          (day.wpm /
                            Math.max(
                              1,
                              ...((analysis()?.dailyBreakdown ?? []).map(
                                (d) => d.wpm,
                              )),
                            )) *
                            48,
                        )}px`,
                      }}
                    ></div>
                    <span class="text-[10px] text-sub">
                      {day.date.slice(5)}
                    </span>
                  </div>
                )}
              </For>
            </div>
          </Show>
          <Show when={analysis()?.recommendation}>
            <div class="rounded bg-bg/50 p-2 text-xs text-sub">
              <span class="font-semibold text-text">Tavsiya: </span>
              {analysis()?.recommendation}
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export function UserProfile(props: {
  profile: UserProfileType;
  isAccountPage?: true;
}): JSXElement {
  return (
    <div class="grid w-full gap-8">
      <UserDetails
        profile={props.profile}
        isAccountPage={props.isAccountPage}
      />
      <Show when={!props.profile.banned && !props.profile.lbOptOut}>
        <LeaderboardPosition
          top15={props.profile.allTimeLbs?.time?.["15"]?.["english"]}
          top60={props.profile.allTimeLbs?.time?.["60"]?.["english"]}
        />
      </Show>
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <PbTable
          mode="time"
          mode2={["15", "30", "60", "120"]}
          pbs={props.profile.personalBests.time}
          isAccountPage={props.isAccountPage}
        />
        <PbTable
          mode="words"
          mode2={["10", "25", "50", "100"]}
          pbs={props.profile.personalBests.words}
          isAccountPage={props.isAccountPage}
        />
      </div>
      <Show when={props.profile.lbOptOut}>
        <span class="text-center text-xs text-sub">
          Note: This account has opted out of the leaderboards, meaning their
          results aren&apos;t verified by the anticheat system and may not be
          legitimate.
        </span>
      </Show>

      <ActivityCalendar
        testActivity={
          props.isAccountPage ? undefined : props.profile.testActivity
        }
        isAccountPage={props.isAccountPage}
      />
      <Show when={props.isAccountPage}>
        <WeeklyAnalysis />
      </Show>
    </div>
  );
}

function LeaderboardPosition(props: {
  top15?: RankAndCount;
  top60?: RankAndCount;
}): JSXElement {
  const format = getFormatting;

  return (
    <div class="grid w-full grid-cols-1 items-center gap-4 rounded bg-sub-alt p-4 text-sub md:grid-cols-2 lg:grid-cols-3">
      <span class="text-center md:col-span-2 lg:col-span-1">
        All-Time English Leaderboards
      </span>
      <Show when={props.top15 !== undefined}>
        <div class="grid grid-cols-2 gap-x-4">
          <div class="justify-self-end">15 seconds</div>
          <div class="row-span-2 text-3xl text-text">
            {format().rank(props.top15?.rank)}
          </div>
          <div class="justify-self-end text-xs">
            {formatTopPercentage(props.top15)}
          </div>
        </div>
      </Show>
      <Show when={props.top60 !== undefined}>
        <div class="grid grid-cols-2 gap-x-4">
          <div class="justify-self-end">60 seconds</div>
          <div class="row-span-2 text-3xl text-text">
            {format().rank(props.top60?.rank)}
          </div>
          <div class="justify-self-end text-xs">
            {formatTopPercentage(props.top60)}
          </div>
        </div>
      </Show>
    </div>
  );
}

function PbTable<M extends "time" | "words">(props: {
  mode: M;
  mode2: string[];
  pbs: PersonalBests[M];
  isAccountPage?: true;
}): JSXElement {
  const format = getFormatting;

  const bests = createMemo(() =>
    props.mode2.map((mode) => {
      const pbArray = props.pbs[mode] ?? [];

      const best = pbArray.reduce<PersonalBest | undefined>(
        (max, current) => (current.wpm > (max?.wpm ?? 0) ? current : max),
        undefined,
      );

      return {
        mode2: mode,
        pb: best,
      };
    }),
  );

  return (
    <div class="grid grid-cols-[1fr_minmax(0,2rem)] rounded bg-sub-alt">
      <div class="grid grid-cols-2 gap-8 p-4 md:grid-cols-4">
        <For each={bests()}>
          {(item) => (
            <div class="group grid items-center">
              <div
                class={
                  item.pb !== undefined
                    ? "col-start-1 row-start-1 text-center transition-opacity group-hover:opacity-0"
                    : "col-start-1 row-start-1 text-center"
                }
              >
                <div class="text-xs text-sub">
                  {item.mode2} {props.mode === "time" ? "seconds" : "words"}
                </div>
                <div class="text-4xl">
                  {format().typingSpeed(item.pb?.wpm, {
                    showDecimalPlaces: false,
                  })}
                </div>
                <div class="text-xl opacity-75">
                  {format().accuracy(item.pb?.acc, {
                    showDecimalPlaces: false,
                  })}
                </div>
              </div>

              <Show when={item.pb !== undefined}>
                <div class="col-start-1 row-start-1 grid bg-sub-alt text-center text-xs opacity-0 transition-opacity group-hover:opacity-100">
                  <div class="text-sub">
                    {item.mode2} {props.mode === "time" ? "seconds" : "words"}
                  </div>
                  <div>
                    {format().typingSpeed(item.pb?.wpm)}{" "}
                    {format().typingSpeedUnit}
                  </div>
                  <div>{format().typingSpeed(item.pb?.raw)} raw</div>
                  <div>{format().accuracy(item.pb?.acc)} acc</div>
                  <div>{format().percentage(item.pb?.consistency)} con</div>
                  <div class="text-sub">
                    {formatDate(item.pb?.timestamp ?? 0, "dd MMM yyyy")}
                  </div>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
      <Show when={props.isAccountPage}>
        <div class="flex h-full flex-col">
          <Button
            balloon={{ text: "Show all personal bests", position: "left" }}
            class="h-full rounded-none rounded-r text-sub hover:text-bg"
            fa={{ icon: "fa-ellipsis-v" }}
            onClick={() => PbTablesModal.show(props.mode)}
          />
        </div>
      </Show>
    </div>
  );
}
