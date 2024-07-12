import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import { styled } from '@mui/system';
import Image from 'next/image';

const StyledBox = styled(Box)<{ bgcolor: string }>(({ bgcolor }) => ({
  backgroundColor: bgcolor,
  padding: '12px',
  borderRadius: '6px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
  boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.25)',
}));

const Card: React.FC<any> = ({
  key,
  bgcolor = '#EDF7ED',
  textColor = '#06753C',
  name = 'test',
  onButtonClick,
  icon,
  secondaryText,
  buttonText,
  buttonVariant = 'contained',
  buttonStyle,
}) => {
  return (
    <StyledBox key={key} bgcolor={bgcolor}>
      <Box display={'flex'} alignItems={'center'} gap={1}>
        {icon && (
          <Box>
            <Image src={icon} width={30} height={30} alt="icon" />
          </Box>
        )}
        <Box>
          <Typography component="p" sx={{ color: textColor, fontWeight: '600' }}>
            {name}
          </Typography>
          {secondaryText && (
            <Typography variant="body2" sx={{ color: textColor, fontSize: '12px' }}>
              {secondaryText}
            </Typography>
          )}
        </Box>
      </Box>
      {buttonText && (
        <Button variant={buttonVariant} size="large" sx={buttonStyle} onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </StyledBox>
  );
};

export default Card;
