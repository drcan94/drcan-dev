import { createStyles } from '@mantine/core'

export const useLayoutStyles = createStyles({
  container: {
    maxWidth: '48rem',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: '3rem',
  },
  writeButton: {
    marginTop: '0rem',
  },
  flex: {
    height: '100%',
    padding: "0"
  },
  menu: {
    marginTop: '.3rem',
  },
  menuItem: {
    ':hover': {
      textDecoration: 'underline',
      textUnderlineOffset: '4px',
      cursor: 'pointer',
    },
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  pointer: {
    cursor: 'pointer',
  },
})
