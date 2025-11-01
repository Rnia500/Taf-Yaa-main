import React from "react";
import { Clock, User } from "lucide-react";
import Card from "../layout/containers/Card";
import Button from "./Button";
import Row from "../layout/containers/Row";
import Divider from "./Divider";
import Spacer from "./Spacer";
import Text from "./Text";
import Pill from "./pill";
import { formatArrivalTime } from '../utils/featuresUtils/formatArrivalTime';

const JoinRequestCard = ({ request, onApprove, onDecline, onView }) => {
  return (
    <Card padding="1rem" alignItems="flex-start" backgroundColor="var(--color-white)" shadow positionType="relative"  borderRadius="20px" >
      {/* Join Request Label */}
      <Card fitContent positionType="absolute" backgroundColor="var(--color-transparent)" position="top-right">
          <Pill backgroundColor="var(--color-primary-dark)" ><Text as="p" bold color="white" style={{fontSize: "0.8rem"}}>Join Request</Text></Pill>
      </Card>
          

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="flex flex-grow items-center gap-4">
          {/* User Icon */}
          <div className="flex-shrink-0">
            <Card rounded fitContent size={45} backgroundColor="var(--color-gray)">
               <User size={22} />
            </Card>
          </div>

          {/* User Info */}
          <div className="flex-grow">
            <div className="flex max-w-72 items-center gap-3">
              <Text as="p" variant="heading3" ellipsis>
                {request?.name || "Unknown User"}
              </Text>
            </div>
            <div className="flex p-0 m-0 max-w-80 items-center gap-3">
            <Text as="p" ellipsis variant="body2">
              {request?.notes || "Wants to join as family member"}
            </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Row padding="0px" margin="0px" fitContent justifyContent="flex-start">
          <Text variant="caption1"> Status:</Text>
           <Pill backgroundColor="var(--color-ModalWaring)" ><Text as="p" color="dark-blue" bold style={{fontSize: "0.8rem"}}>{request?.status || "unknown"}</Text></Pill>
        </Row>
      </div>

      <Spacer size="sm"/>
      <Divider />
      <Spacer size="sm"/>

      {/* Footer */}
      <Row padding="0" margin="0" fitContent justifyContent="space-between" gap="10px">
        {/* Time Info */}
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-neutral-500 dark:text-neutral-400" />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Requested {formatArrivalTime({ createdAt: request?.createdAt })}
          </p>
        </div>

        {/* Action Buttons */}
        <Row padding="0px" margin="0px" gap="10x" fitContent justify="flex-end">
          <Button
            variant="link"
            onClick={() => onView?.(request)}
            className="text-primary hover:underline text-sm font-medium"
          >
            View Details
          </Button>

          <Button
            variant="secondary"
            onClick={() => onDecline?.(request)}
            className="flex min-w-[90px] items-center justify-center rounded-lg h-9 px-4 bg-neutral-200/80 dark:bg-zinc-800 text-neutral-800 dark:text-neutral-200 text-sm font-semibold leading-normal hover:bg-neutral-300/70 dark:hover:bg-zinc-700 transition-colors"
          >
            Decline
          </Button>

          <Button
            variant="primary"
            onClick={() => onApprove?.(request)}
            className="flex min-w-[90px] items-center justify-center rounded-lg h-9 px-4 bg-primary text-neutral-900 text-sm font-semibold leading-normal hover:bg-primary/90 transition-colors"
          >
            Approve
          </Button>
        </Row>
      </Row>
    </Card>
  );
};

export default JoinRequestCard;
